import { Column } from '@/components/layout/column';
import { Container } from '@/components/layout/container';
import { Row } from '@/components/layout/row';
import { ExplorerHeader } from '@/components/pages/explorer/shared/header';
import { ListItem } from '@/components/ui/list/item';
import { TopNavigator } from '@/components/ui/top-navigator';
import { GoBack } from '@/components/ui/top-navigator/go-back';
import { Typo } from '@/components/ui/typography';
import { diaryManager } from '@/lib/managers/diary';
import { friendManager } from '@/lib/managers/friend';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ExplorerDiariesPage() {
	const navigate = useNavigate();
	const diaries = diaryManager.getAllDiaries();

	return (
		<>
			<TopNavigator leadingArea={<GoBack label='프로필' />} />
			<ExplorerHeader
				title='일기'
				count={diaries.length}
				search
				placeholder='제목 또는 내용으로 검색'
			/>
			<Container>
				<Column gap={8}>
					{diaries.map((d) => (
						<ListItem
							key={d.uuid}
							leadingArea={
								<Row align='center' gap={8}>
									<Typo.Lead>{d.emoji}</Typo.Lead>
									<Typo.Body weight='strong'>
										{d.title || '제목 없음'}
									</Typo.Body>
								</Row>
							}
							trailingArea={
								<Row gap={8} align='center'>
									{d.sharedBy && (
										<Typo.Caption>
											{friendManager.getFriend(d.sharedBy)?.name} 작성
										</Typo.Caption>
									)}
									<ChevronRight size={20} />
								</Row>
							}
							onClick={() => navigate(`/explorer/diaries/${d.uuid}`)}
						/>
					))}
				</Column>
			</Container>
		</>
	);
}
