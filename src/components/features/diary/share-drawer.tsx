import type { OverlayProps } from '@/components/ui/overlay/types';
import { useOverlay } from '@/hooks/use-overlay';
import { diaryManager } from '@/lib/managers/diary';
import type { User } from '@/lib/managers/friend';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { message } from '@tauri-apps/plugin-dialog';
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useMemo,
	useState,
} from 'react';
import { UserPickerDrawer } from '../user/picker-drawer';
import { DiaryStopURLSharingPopup } from './stop-url-sharing-popup';
import { DiaryURLCopiedPopup } from './url-copied-popup';

interface DiaryShareDrawerProps {
	diary: Diary;
	isAttachmentUpdated: boolean;
	setDiary: Dispatch<SetStateAction<Diary>>;
}

export function ShareDiaryDrawer(props: DiaryShareDrawerProps & OverlayProps) {
	const { diary, setDiary, close } = props;
	const [isProcessing, setIsProcessing] = useState(false);
	const isSharable = useMemo(
		() => diary.emoji || diary.title || diary.content,
		[diary],
	);
	const { show: openURLCopied } = useOverlay(DiaryURLCopiedPopup);
	const { show: openStopURLSharing } = useOverlay(DiaryStopURLSharingPopup);

	const onClickShare = useCallback(
		async (selectedUsers: Array<User>) => {
			if (!isSharable) {
				await message('일기를 공유하려면 내용을 추가해주세요.');
				return;
			}

			if (!diary.shareUUID && selectedUsers.length === 0) {
				await message('일기를 공유하려면 최소 한 명의 사용자를 선택해주세요.');
				return;
			}

			setIsProcessing(true);

			let uuid = diary.uuid;
			let result: Diary;
			if (uuid === 'NOT_SAVED') {
				const savedDiary = await diaryManager.addDiary(diary);
				uuid = savedDiary.uuid;
			}
			if (selectedUsers.length > 0) {
				result = await diaryManager.shareDiary(uuid, selectedUsers);
			} else {
				result = await diaryManager.cancelShare(uuid);
			}

			setDiary(result);
			setIsProcessing(false);
			close();
		},
		[diary, isSharable, setDiary, close],
	);

	const onClickShareViaUrl = useCallback(async () => {
		if (!isSharable) {
			await message('일기를 공유하려면 내용을 추가해주세요.');
			return;
		}

		try {
			setIsProcessing(true);

			let uuid = diary.uuid;
			if (uuid === 'NOT_SAVED') {
				const savedDiary = await diaryManager.addDiary(diary);
				uuid = savedDiary.uuid;
			} else {
				await diaryManager.updateDiary(uuid, diary, false);
			}

			const { url, diary: result } = await diaryManager.shareDiaryViaURL(uuid);
			setDiary(result);
			await writeText(url);
			openURLCopied({ url });
		} finally {
			setIsProcessing(false);
		}
	}, [isSharable, diary, setDiary, openURLCopied]);

	const onStopUrlSharingClick = useCallback(async () => {
		if (!diary.isSharedViaURL) {
			await message('이 일기는 URL을 통해 공유되지 않았습니다.');
			return;
		}

		setIsProcessing(true);

		try {
			await diaryManager.stopURLSharingAndReEncrypt(diary.uuid);
		} finally {
			setIsProcessing(false);
		}
	}, [diary.isSharedViaURL, diary.uuid]);

	const onClickStopShareViaUrl = useCallback(() => {
		openStopURLSharing({
			onStopUrlSharingClick,
		});
	}, [openStopURLSharing, onStopUrlSharingClick]);

	return (
		<UserPickerDrawer
			title='친구들에게 일기 공유하기'
			buttons={[
				{
					label: diary.isSharedViaURL ? 'URL 공유 중단' : 'URL로 공유',
					variant: 'secondary',
					loading: isProcessing,
					onClick: diary.isSharedViaURL
						? onClickStopShareViaUrl
						: onClickShareViaUrl,
				},
				{ label: '공유', loading: isProcessing, onClick: onClickShare },
			]}
			defaultSelected={diary.sharedWith}
			close={close}
		/>
	);
}
