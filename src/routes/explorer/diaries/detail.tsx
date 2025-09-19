import { DeleteDiaryPopup } from '@/components/features/diary/delete-popup';
import { Column } from '@/components/layout/column';
import { Container } from '@/components/layout/container';
import { Row } from '@/components/layout/row';
import { ExplorerContent } from '@/components/pages/explorer/shared/content';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { PaddingDivider } from '@/components/ui/divider/padding';
import { TopNavigator } from '@/components/ui/top-navigator';
import { GoBack } from '@/components/ui/top-navigator/go-back';
import { Typo } from '@/components/ui/typography';
import { useOverlay } from '@/hooks/use-overlay';
import { bytesToSize } from '@/lib/common';
import { diaryManager } from '@/lib/managers/diary';
import { friendManager } from '@/lib/managers/friend';
import { color } from '@/styles/color.css';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ExplorerDiariesDetailPage() {
	const { uuid } = useParams();
	const navigate = useNavigate();
	const diary = useMemo(() => diaryManager.getDiary(uuid || ''), [uuid]);
	const [showEncryptedData, setShowEncryptedData] = useState(false);
	const { show: openDiaryDelete } = useOverlay(DeleteDiaryPopup);

	const onClickRevealData = useCallback(() => {
		setShowEncryptedData(true);
	}, []);

	const onClickDeleteDiary = useCallback(() => {
		if (diary) {
			openDiaryDelete({ diary, callback: () => navigate(-1) });
		}
	}, [diary, navigate, openDiaryDelete]);

	if (!diary) {
		console.error('Diary not found:', uuid);
		navigate(-1);
		return;
	}

	return (
		<>
			<TopNavigator leadingArea={<GoBack label='일기' />} />
			<Container vertical='small'>
				<Typo.Title weight='strong'>{diary.title || '제목 없음'}</Typo.Title>
			</Container>
			<Container vertical='small'>
				<Row align='center' justify='start' gap={8}>
					<Avatar
						size={32}
						src={
							diary.sharedBy
								? friendManager.getFriend(diary.sharedBy)?.profileUrl
								: localStorage.getItem('profileImage')
						}
					/>
					<Typo.Body weight='medium'>
						{diary.sharedBy
							? `${friendManager.getFriend(diary.sharedBy)?.name}님이 공유함`
							: `${localStorage.getItem('name')}님 작성`}
					</Typo.Body>
				</Row>
			</Container>
			<PaddingDivider />
			{showEncryptedData ? (
				<ExplorerContent
					label='암호화된 데이터'
					content={diary.encryptedData?.toString() || '데이터 없음'}
				/>
			) : (
				<Container>
					<Button fill variant='secondary' onClick={onClickRevealData}>
						데이터 보기 - {bytesToSize(diary.encryptedData?.length ?? 0)}
					</Button>
				</Container>
			)}
			<PaddingDivider />
			<ExplorerContent
				label='Nonce'
				content={diary.nonce?.toString() || '데이터 없음'}
			/>
			<PaddingDivider />
			{diary.encryptedKey && (
				<ExplorerContent
					label='암호화된 키'
					content={diary.encryptedKey?.toString() || '데이터 없음'}
				/>
			)}
			<Container>
				<Column gap={8}>
					<Typo.Caption color={color.sand}>
						생성일 : {new Date(diary.createdAt).toLocaleString()}
					</Typo.Caption>
					<Typo.Caption color={color.sand}>
						수정일 : {new Date(diary.updatedAt).toLocaleString()}
					</Typo.Caption>
				</Column>
			</Container>
			<ButtonGroup float>
				<Button fill onClick={onClickDeleteDiary}>
					일기 삭제
				</Button>
			</ButtonGroup>
		</>
	);
}
