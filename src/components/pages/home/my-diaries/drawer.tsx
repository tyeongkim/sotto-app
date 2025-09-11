import { DeleteDiaryPopup } from '@/components/features/diary/delete-popup';
import { DiaryDetailDrawer } from '@/components/features/diary/detail-drawer';
import { Container } from '@/components/layout/container';
import { AvatarItem } from '@/components/ui/avatar/item';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { Typo } from '@/components/ui/typography';
import { useOverlay } from '@/hooks/use-overlay';
import { log } from '@/lib/log';
import { diaryManager } from '@/lib/managers/diary';
import { friendManager } from '@/lib/managers/friend';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback } from 'react';
import { list } from './styles/my-diary-drawer.css';

interface HomeMyDiaryDrawerProps {
	diary: Diary;
	onDelete?: () => void;
}

export function HomeMyDiaryDrawer(
	props: HomeMyDiaryDrawerProps & OverlayProps,
) {
	const { diary, onDelete, close } = props;
	const { show: openDelete } = useOverlay(DeleteDiaryPopup);

	const onClickCancelSharing = useCallback(async () => {
		try {
			await diaryManager.cancelShare(diary.uuid);
		} catch (error) {
			log('error', 'Fail to cancel sharing diary', error);
			await message('일기 공유 중지에 실패했습니다.');
		} finally {
			close();
		}
	}, [diary, close]);

	const onClickDelete = useCallback(() => {
		openDelete({
			diary,
			callback: () => {
				if (onDelete) {
					onDelete();
				}
				close();
			},
		});
	}, [diary, openDelete, onDelete, close]);

	return (
		<DiaryDetailDrawer diary={diary} close={close}>
			{diary.sharedWith.length > 0 && (
				<Container vertical='small' horizontal='none'>
					<Container vertical='small'>
						<Typo.Body weight='medium'>
							{diary.sharedWith.length.toLocaleString()}명의 친구와 공유됨
						</Typo.Body>
					</Container>
					<div className={list}>
						{diary.sharedWith.map((uuid) => {
							const friend = friendManager.getFriend(uuid);
							if (!friend) return null;
							return <AvatarItem key={friend.uuid} user={friend} selected />;
						})}
					</div>
				</Container>
			)}
			<ButtonGroup>
				{diary.sharedWith.length > 0 && (
					<Button fill variant='secondary' onClick={onClickCancelSharing}>
						공유 중지
					</Button>
				)}
				<Button fill onClick={onClickDelete}>
					일기 삭제
				</Button>
			</ButtonGroup>
		</DiaryDetailDrawer>
	);
}
