import { Column } from '@/components/layout/column';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Content } from '@/components/ui/content';
import { resetApp } from '@/lib/app';
import { confirm } from '@tauri-apps/plugin-dialog';
import { ShieldQuestion } from 'lucide-react';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { page } from './page.css';

export default function SignInForgotPinPage() {
	const onClickDelete = useCallback(async () => {
		if (
			await confirm(
				'이 작업은 되돌릴 수 없습니다. 새 계정을 만들어야 하며 모든 일기가 삭제됩니다.',
				{
					title: '모든 일기를 삭제하고 로그아웃할까요?',
					kind: 'warning',
				},
			)
		) {
			await resetApp();
			location.reload();
		}
	}, []);

	return (
		<Column className={page}>
			<Content
				icon={<ShieldQuestion size={48} />}
				title='PIN을 잊으셨나요?'
				description='모든 일기를 삭제하고 로그아웃해야 합니다'
			/>
			<ButtonGroup direction='vertical' bottomSafeAreaPadding>
				<Button fill variant='text' onClick={onClickDelete}>
					모든 데이터를 삭제하고 로그아웃
				</Button>
				<Link to='/sign-in/pin'>
					<Button fill>취소</Button>
				</Link>
			</ButtonGroup>
		</Column>
	);
}
