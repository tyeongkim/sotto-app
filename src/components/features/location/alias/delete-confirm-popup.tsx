import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { Popup } from '@/components/ui/popup';
import { PopupContent } from '@/components/ui/popup/content';
import { log } from '@/lib/log';
import { type Location, locationManager } from '@/lib/managers/location';
import { message } from '@tauri-apps/plugin-dialog';
import { TriangleAlert } from 'lucide-react';
import { useCallback } from 'react';

interface LocationAliasDeleteConfirmPopupProps {
	alias: Location;
}

export function LocationAliasDeleteConfirmPopup(
	props: LocationAliasDeleteConfirmPopupProps & OverlayProps,
) {
	const { alias, close } = props;

	const onClickDelete = useCallback(async () => {
		try {
			await locationManager.deleteAlias(alias.uuid);
		} catch (error) {
			log('error', 'Failed to delete alias:', error);
			await message('별칭 삭제에 실패했어요.');
			return;
		} finally {
			close();
		}
	}, [alias.uuid, close]);

	return (
		<Popup>
			<PopupContent
				icon={<TriangleAlert />}
				title={`\"${alias.name}\"을(를) 삭제할까요?`}
				description='이 작업은 되돌릴 수 없어요.'
			/>
			<ButtonGroup smallPadding>
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
