import { Container } from '@/components/layout/container';
import { center } from '@/components/pages/home/styles/friends-diaries.css';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Drawer } from '@/components/ui/drawer';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { Typo } from '@/components/ui/typography';
import { log } from '@/lib/log';
import { diaryManager } from '@/lib/managers/diary';
import { type User, friendManager } from '@/lib/managers/friend';
import { apiClient } from '@/lib/managers/http';
import { banWarning } from '@/routes/home/page.css';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback } from 'react';

interface BanUserDrawerProps {
	friend: User;
	callback?: (friend: User) => unknown;
}

export function BanFriendDrawer(props: BanUserDrawerProps & OverlayProps) {
	const { friend, callback, close } = props;

	const onClickBlock = useCallback(async () => {
		try {
			for (const diary of diaryManager.getFriendDiaries(friend.uuid)) {
				await diaryManager.removeDiary(diary.uuid);
			}
			friendManager.removeFriend(friend.uuid);

			await apiClient.post('/users/ban', {
				uuid: friend.uuid,
			});

			await callback?.(friend);
		} catch (error) {
			log('error', 'Failed to block friend', error);
			await message('친구 차단에 실패했습니다');
		}

		close();
	}, [friend, callback, close]);

	return (
		<Drawer close={close}>
			<Container horizontal='none'>
				<Container vertical='regular' className={center}>
					<Avatar size={56} src={friend.profileUrl} />
				</Container>
				<Container className={center} vertical='small'>
					<Typo.Lead weight='strong'>“{friend.name}”님을 차단할까요?</Typo.Lead>
				</Container>
				<Container className={center} vertical='none'>
					<Typo.Body className={banWarning}>
						앞으로 “{friend.name}”님의 일기를 받을 수 없어요
					</Typo.Body>
				</Container>
			</Container>
			<ButtonGroup direction='horizontal'>
				<Button fill onClick={onClickBlock}>
					차단
				</Button>
				<Button variant='secondary' fill onClick={close}>
					취소
				</Button>
			</ButtonGroup>
		</Drawer>
	);
}
