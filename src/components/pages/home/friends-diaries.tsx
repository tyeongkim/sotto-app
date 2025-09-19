import { decryptDiary } from '@/binding/function/decrypt-diary';
import { BanFriendDrawer } from '@/components/features/user/ban-drawer';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Row } from '@/components/layout/row';
import { Avatar } from '@/components/ui/avatar';
import { DiaryCard } from '@/components/ui/card/diary';
import { Content } from '@/components/ui/content';
import { Divider } from '@/components/ui/divider';
import { LoadingCircle } from '@/components/ui/loading-circle';
import { Typo } from '@/components/ui/typography';
import { useDrawer } from '@/hooks/use-drawer';
import { log } from '@/lib/log';
import { diaryManager } from '@/lib/managers/diary';
import { friendManager } from '@/lib/managers/friend';
import { apiClient } from '@/lib/managers/http';
import { storageClient } from '@/lib/managers/storage';
import { message } from '@tauri-apps/plugin-dialog';
import { Ban, SmilePlus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

export function HomeFriendsDiariesSection() {
	const [friendList, setFriendList] = useState<Array<string>>(
		friendManager
			.getFriends()
			.map((friend) => friend.uuid)
			.filter((userUUID) => diaryManager.getFriendDiaries(userUUID).length > 0),
	);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		apiClient
			.get<SharedDiariesResponse>('/diaries/shared')
			.then(async (data) => {
				const privateKey = await storageClient.get('privateKey');
				if (!privateKey) {
					log('error', 'Private key not found in storage - storage initialized:', storageClient.isInitialized);
					throw new Error('Private key not found');
				}
				log('debug', 'Successfully retrieved private key from storage');
				for (const sharedDiary of data) {
					const decryptedDiary = await decryptDiary(
						privateKey,
						sharedDiary.diary.data,
						sharedDiary.encryptedKey,
						sharedDiary.diary.nonce,
					);

					if (friendManager.isFriend(sharedDiary.diary.owner.uuid)) {
						friendManager.updateFriend(
							sharedDiary.diary.owner.uuid,
							sharedDiary.diary.owner,
						);
					}

					if (!diaryManager.isSharedDiaryExists(sharedDiary.diary.uuid)) {
						friendManager.addFriend(sharedDiary.diary.owner);
						await diaryManager.addDiary({
							uuid: sharedDiary.diary.uuid,
							...decryptedDiary,
							shareUUID: sharedDiary.diary.uuid,
							sharedBy: sharedDiary.diary.owner.uuid,
							encryptedData: sharedDiary.diary.data,
							nonce: sharedDiary.diary.nonce,
							encryptedKey: sharedDiary.encryptedKey,
							readonly: true,
						});
					} else {
						await diaryManager.updateDiary(sharedDiary.diary.uuid, {
							...decryptedDiary,
							encryptedData: sharedDiary.diary.data,
							nonce: sharedDiary.diary.nonce,
							encryptedKey: sharedDiary.encryptedKey,
						});
					}
				}
				for (const existingSharedDiary of diaryManager.getSharedDiaries()) {
					const isSharingCanceled = data.every(
						(b) => b.diary.uuid !== existingSharedDiary.shareUUID,
					);
					if (isSharingCanceled) {
						await diaryManager.removeDiary(existingSharedDiary.uuid);
					}
				}
				setFriendList(
					friendManager
						.getFriends()
						.map((friend) => friend.uuid)
						.filter(
							(userUUID) => diaryManager.getFriendDiaries(userUUID).length > 0,
						),
				);
			})
			.catch(async (error) => {
				await message('친구들의 일기를 불러오는 중에 문제가 발생했습니다.', {
					kind: 'error',
				});
				log('error', 'Failed to load shared diaries:', error);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	if (isLoading) {
		return (
			<Content
				icon={<LoadingCircle size={48} />}
				description='친구들의 일기를 불러오는 중...'
			/>
		);
	}

	return friendList.length > 0 ? (
		friendList.map((userUUID) => (
			<FriendDiaries key={userUUID} userUUID={userUUID} />
		))
	) : (
		<Content
			icon={<SmilePlus size={48} />}
			description='친구에게 이 앱을 공유해보세요'
		/>
	);
}

interface FriendDiariesProps {
	userUUID: string;
}

function FriendDiaries(props: FriendDiariesProps) {
	const { userUUID } = props;

	const { show } = useDrawer(BanFriendDrawer);
	const user = friendManager.getFriend(userUUID);
	const diaries = diaryManager.getFriendDiaries(userUUID);

	const showBanDrawer = useCallback(() => {
		if (user) {
			show({ friend: user });
		} else {
			log('error', 'User not found for ban drawer');
		}
	}, [show, user]);

	if (!user) {
		return null;
	}

	return (
		<>
			<Container vertical='small'>
				<Row align='center' justify='space-between'>
					<Row align='center' gap={8}>
						<Avatar src={user.profileUrl} />
						<Typo.Body weight='strong'>{user.name}</Typo.Body>
					</Row>
					<Ban size={20} onClick={showBanDrawer} />
				</Row>
			</Container>
			<Container vertical='small'>
				<Grid>
					{diaries.map((d) => (
						<DiaryCard key={d.uuid} diary={d} />
					))}
				</Grid>
			</Container>
			<Container horizontal='none'>
				<Divider />
			</Container>
		</>
	);
}
