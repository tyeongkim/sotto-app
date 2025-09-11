import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { Popup } from '@/components/ui/popup';
import { PopupContent } from '@/components/ui/popup/content';
import { TriangleAlert } from 'lucide-react';
import { useCallback } from 'react';

interface DiaryStopURLSharingPopupProps {
	onStopUrlSharingClick: () => unknown;
}

export function DiaryStopURLSharingPopup(
	props: DiaryStopURLSharingPopupProps & OverlayProps,
) {
	const { onStopUrlSharingClick, close } = props;

	const onClickStop = useCallback(() => {
		try {
			onStopUrlSharingClick();
		} finally {
			close();
		}
	}, [onStopUrlSharingClick, close]);

	return (
		<Popup>
			<PopupContent
				icon={<TriangleAlert />}
				title='URL 공유를 중지할까요?'
				description='기존 URL은 더 이상 사용할 수 없으며 되돌릴 수 없어요'
			/>
			<ButtonGroup smallPadding>
				<Button fill onClick={onClickStop}>
					중지
				</Button>
				<Button fill variant='secondary' onClick={close}>
					취소
				</Button>
			</ButtonGroup>
		</Popup>
	);
}
