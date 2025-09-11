import { Column } from '@/components/layout/column';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { PINInput } from '@/components/ui/input/pin';
import { Typo } from '@/components/ui/typography';
import { processSignIn } from '@/lib/app';
import { log } from '@/lib/log';
import { message } from '@tauri-apps/plugin-dialog';
import { Link, useNavigate } from 'react-router-dom';
import { getItem } from 'tauri-plugin-keychain';
import { page, title } from './page.css';

export default function SignInPinPage() {
	const navigate = useNavigate();

	const onPin = async (pin: string) => {
		try {
			const savedPin = await getItem('sotto-app');
			if (!savedPin) {
				throw new Error('PIN not found');
			}
			if (pin !== savedPin) {
				await message('잘못된 PIN입니다', { kind: 'error' });
				return;
			}

			await processSignIn(pin);

			navigate('/home');
		} catch (error) {
			log('error', 'PIN authentication failed', error);
			await message('PIN 인증에 실패했습니다', { kind: 'error' });
		}
	};

	return (
		<Column className={page}>
			<Column className={page}>
				<Container className={title}>
					<Typo.Lead weight='strong'>PIN을 입력하세요</Typo.Lead>
				</Container>
				<Container vertical='small'>
					<PINInput onPin={onPin} />
				</Container>
			</Column>
			<ButtonGroup direction='vertical' bottomSafeAreaPadding>
				<Link to='/sign-in/forgot-pin'>
					<Button fill variant='text'>
						PIN을 잊으셨나요?
					</Button>
				</Link>
				{localStorage.getItem('useBiometricLogin') === 'true' && (
					<Link to='/sign-in/biometric'>
						<Button fill variant='secondary'>
							생체 인증으로 로그인
						</Button>
					</Link>
				)}
			</ButtonGroup>
		</Column>
	);
}
