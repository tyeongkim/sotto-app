import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { Popup } from '@/components/ui/popup';
import { PopupContent } from '@/components/ui/popup/content';
import {
	type LocationPresetKey,
	locationManager,
} from '@/lib/managers/location';
import { TriangleAlert } from 'lucide-react';
import { useCallback } from 'react';

interface LocationPresetsResetConfirmPopupProps {
	name: LocationPresetKey;
	callback?: () => unknown;
}

export function LocationPresetsResetConfirmPopup(
	props: LocationPresetsResetConfirmPopupProps & OverlayProps,
) {
	const { name, callback, close } = props;

	const onClickReset = useCallback(async () => {
		await locationManager.resetPreset(name);
		callback?.();
		close();
	}, [name, callback, close]);

	const onClickCancel = useCallback(() => {
		close();
	}, [close]);

	return (
		<Popup>
			<PopupContent
				icon={<TriangleAlert />}
				title={`\"${locationManager.getPresetName(name)}\"를 초기화할까요?`}
				description='이 작업은 되돌릴 수 없어요.'
			/>
			<ButtonGroup smallPadding direction='horizontal'>
				<Button fill onClick={onClickReset}>
					초기화
				</Button>
				<Button fill variant='secondary' onClick={onClickCancel}>
					취소
				</Button>
			</ButtonGroup>
		</Popup>
	);
}
