import { generateKeyPair } from '@/binding/function/generate-key-pair';
import { SignUpBiometricSection } from '@/components/pages/sign-up/biometric';
import { SignUpConfirmPinSection } from '@/components/pages/sign-up/confirm-pin';
import { SignUpFlowContext } from '@/components/pages/sign-up/context';
import { SignUpInformationSection } from '@/components/pages/sign-up/information';
import { SignUpSetPinSection } from '@/components/pages/sign-up/set-pin';
import { Flow } from '@/components/ui/flow';
import { processSignIn } from '@/lib/app';
import { log } from '@/lib/log';
import { apiClient } from '@/lib/managers/http';
import { storageClient } from '@/lib/managers/storage';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveItem } from 'tauri-plugin-keychain';

export default function SignUpPage() {
	const [profileImage, setProfileImage] = useState<string | null>(null);
	const [name, setName] = useState<string>('');
	const [username, setUsername] = useState<string>('');
	const [pin, setPin] = useState<string>('');
	const [confirmPin, setConfirmPin] = useState<string>('');
	const [useBiometricLogin, setUseBiometricLogin] = useState<boolean>(false);
	const navigate = useNavigate();

	const onClickSignUp = useCallback(
		async (biometricLogin: boolean) => {
			setUseBiometricLogin(biometricLogin);

			const { publicKeyPem, privateKeyPem } = await generateKeyPair();
			try {
				await storageClient.init(pin);
				await saveItem('sotto-app', pin);

				const { accessToken, user } = await apiClient.post<SignUpResponse>(
					'/users',
					{
						name,
						username,
						profileUrl: profileImage,
						publicKey: publicKeyPem,
					},
				);

				try {
					await storageClient.set('publicKey', publicKeyPem);
					await storageClient.set('privateKey', privateKeyPem);
					log('debug', 'Successfully stored keys in storage');
				} catch (keyStorageError) {
					log('error', 'Failed to store keys:', keyStorageError);
					throw new Error(`키 저장 실패: ${keyStorageError}`);
				}
				if (profileImage) {
					localStorage.setItem('profileImage', profileImage);
				}

				localStorage.setItem('app-initialized', 'true');
				localStorage.setItem('accessToken', accessToken);
				localStorage.setItem('username', username);
				localStorage.setItem('name', name);
				localStorage.setItem('useBiometricLogin', biometricLogin.toString());

				await message(`회원가입이 완료되었습니다! 환영합니다 ${user.name}`);
				await processSignIn(pin);

				navigate('/home');
			} catch (error) {
				await message(
					`회원가입에 실패했습니다. ${error}, ${apiClient.getBaseUrl()}`,
					{ kind: 'error' },
				);
				log('error', error);
			}
		},
		[name, username, profileImage, pin, navigate],
	);

	return (
		<SignUpFlowContext
			value={{
				profileImage,
				name,
				username,
				pin,
				confirmPin,
				useBiometricLogin,
				setProfileImage,
				setName,
				setUsername,
				setPin,
				setConfirmPin,
				setUseBiometricLogin,
			}}
		>
			<Flow
				pages={[
					<SignUpInformationSection key='information' />,
					<SignUpSetPinSection key='set-pin' />,
					<SignUpConfirmPinSection key='confirm-pin' />,
					<SignUpBiometricSection key='biometric' signUp={onClickSignUp} />,
				]}
			/>
		</SignUpFlowContext>
	);
}
