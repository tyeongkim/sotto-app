import { Column } from '@/components/layout/column';
import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Input } from '@/components/ui/input';
import { InputField } from '@/components/ui/input/field';
import { ImageInput } from '@/components/ui/input/image';
import { TopNavigator } from '@/components/ui/top-navigator';
import { GoBack } from '@/components/ui/top-navigator/go-back';
import { Typo } from '@/components/ui/typography';
import { useFlow } from '@/hooks/use-flow';
import { resizeImage } from '@/lib/common';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback, useContext } from 'react';
import { SignUpFlowContext } from './context';
import { fillHeight, title } from './styles/styles.css';

export function SignUpInformationSection() {
	const { next } = useFlow();
	const { name, username, setProfileImage, setName, setUsername } =
		useContext(SignUpFlowContext);

	const onChangeProfileImage = useCallback(
		async (image: File | null) => {
			if (image) {
				setProfileImage(await resizeImage(image, 128));
			} else {
				setProfileImage(null);
			}
		},
		[setProfileImage],
	);

	const onClickSignUp = useCallback(async () => {
		if (!name) {
			await message('이름을 입력해주세요.', { kind: 'error' });
			return;
		}
		if (name.length < 1 || name.length > 50) {
			await message('이름은 1자 이상 50자 이하여야 합니다.', {
				kind: 'error',
			});
			return;
		}

		if (!username) {
			await message('사용자 이름을 입력해주세요.', { kind: 'error' });
			return;
		}
		if (username.length < 6 || username.length > 24) {
			await message('사용자 이름은 6자 이상 24자 이하여야 합니다.', {
				kind: 'error',
			});
			return;
		}
		if (!/^[a-zA-Z0-9.]+$/.test(username)) {
			await message('사용자 이름은 영문자, 숫자, 마침표만 사용할 수 있어요.', {
				kind: 'error',
			});
			return;
		}

		next();
	}, [name, username, next]);

	return (
		<Column className={fillHeight}>
			<TopNavigator leadingArea={<GoBack />} />
			<Column className={fillHeight}>
				<Container className={title}>
					<Typo.Title weight='strong'>회원가입</Typo.Title>
				</Container>
				<InputField label='프로필 이미지'>
					<ImageInput onImage={onChangeProfileImage} />
				</InputField>
				<InputField label='이름'>
					<Input placeholder='이름' value={name} onValue={setName} />
				</InputField>
				<InputField label='사용자 이름'>
					<Input
						placeholder='영문/숫자/점(.)만 사용 가능'
						value={username}
						onValue={setUsername}
					/>
				</InputField>
			</Column>
			<ButtonGroup bottomSafeAreaPadding>
				<Button fill onClick={onClickSignUp}>
					회원가입
				</Button>
			</ButtonGroup>
		</Column>
	);
}
