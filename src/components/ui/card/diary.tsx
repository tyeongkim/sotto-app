import { AppContext } from '@/App';
import { Column } from '@/components/layout/column';
import { Container } from '@/components/layout/container';
import { HomeFriendDiaryDrawer } from '@/components/pages/home/friend-diary-drawer';
import { HomeMyDiaryDrawer } from '@/components/pages/home/my-diaries/drawer';
import { useOverlay } from '@/hooks/use-overlay';
import { calculateDiffDays } from '@/lib/common';
import { useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typo } from '../typography';
import { card, content, preventOverflow, preview, title } from './styles.css';

interface DiaryCardProps {
	diary: Diary;
}

export function DiaryCard(props: DiaryCardProps) {
	const { diary } = props;
	const navigate = useNavigate();
	const { forceUpdate } = useContext(AppContext);
	const diffDays = useMemo(
		() => calculateDiffDays(new Date(diary.createdAt)),
		[diary.createdAt],
	);
	const { show } = useOverlay(
		diary.sharedBy ? HomeFriendDiaryDrawer : HomeMyDiaryDrawer,
	);

	const onClick = useCallback(() => {
		navigate(`/diary?uuid=${diary.uuid}&readonly=${diary.readonly ?? false}`);
	}, [diary, navigate]);

	const onLongPress = useCallback(() => {
		show({ diary, onDelete: forceUpdate });
	}, [diary, show, forceUpdate]);

	return (
		<Container className={card} onClick={onClick} onLongPress={onLongPress}>
			<Column className={content} align='end' justify='space-between'>
				<Typo.Caption>
					{diffDays === 0
						? '오늘'
						: diffDays === 1
							? '어제'
							: `${diffDays}일 전`}
				</Typo.Caption>
				<Column className={preventOverflow} justify='end' align='start'>
					<Typo.Title>{diary.emoji}</Typo.Title>
					<Typo.Body className={title} weight='strong'>
						{diary.title || '제목없음'}
					</Typo.Body>
					<Typo.Caption className={preview}>
						{diary.content.split('\n')[0].trim() || '아직 내용이 없어요 :('}
					</Typo.Caption>
				</Column>
			</Column>
		</Container>
	);
}
