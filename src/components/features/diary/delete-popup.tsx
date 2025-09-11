import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { Popup } from '@/components/ui/popup';
import { PopupContent } from '@/components/ui/popup/content';
import { useAuth } from '@/hooks/use-auth';
import { log } from '@/lib/log';
import { diaryManager } from '@/lib/managers/diary';
import { message } from '@tauri-apps/plugin-dialog';
import { TriangleAlert } from 'lucide-react';
import { useCallback } from 'react';

interface DeleteDiaryPopupProps {
	diary: Diary;
	callback: () => unknown;
}

export function DeleteDiaryPopup(props: DeleteDiaryPopupProps & OverlayProps) {
	const { diary, callback, close } = props;
	const authenticate = useAuth();

	const onClickDelete = useCallback(() => {
		authenticate(async () => {
			try {
				await diaryManager.removeDiary(diary.uuid);
				await callback();
			} catch (error) {
				log('error', 'Failed to delete diary:', error);
				await message('일기 삭제에 실패했습니다.');
			} finally {
				close();
			}
		});
	}, [authenticate, diary, close, callback]);

	return (
		<Popup>
			<PopupContent
				icon={<TriangleAlert />}
				title='일기를 삭제할까요?'
				description='삭제된 일기는 복구할 수 없어요'
			/>
			<ButtonGroup direction='horizontal' smallPadding>
				<Button fill onClick={onClickDelete}>
					삭제
				</Button>
				<Button fill variant='secondary' onClick={close}>
					취소
				</Button>
			</ButtonGroup>
		</Popup>
	);
}
