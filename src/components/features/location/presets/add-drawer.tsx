import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Drawer } from '@/components/ui/drawer';
import { DrawerTitle } from '@/components/ui/drawer/title';
import { Input } from '@/components/ui/input';
import { InputField } from '@/components/ui/input/field';
import type { OverlayProps } from '@/components/ui/overlay/types';
import {
	type LocationPresetKey,
	locationManager,
} from '@/lib/managers/location';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback, useState } from 'react';

interface LocationPresetsAddDrawerProps {
	name: LocationPresetKey;
}

export function LocationPresetsAddDrawer(
	props: LocationPresetsAddDrawerProps & OverlayProps,
) {
	const { name, close } = props;

	const [address, setAddress] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const onClickAdd = useCallback(async () => {
		if (!address.trim()) {
			await message('유효한 주소를 입력해 주세요.');
			return;
		}

		setIsLoading(true);
		try {
			await locationManager.setPreset(name, address);
			close();
			setTimeout(() => setAddress(''), 200);
		} catch (error) {
			await message('프리셋 추가에 실패했어요');
		} finally {
			setIsLoading(false);
		}
	}, [address, close, name]);

	return (
		<Drawer close={close}>
			<DrawerTitle>"{locationManager.getPresetName(name)}" 추가</DrawerTitle>
			<InputField>
				<Input placeholder='주소 입력' value={address} onValue={setAddress} />
			</InputField>
			<ButtonGroup>
				<Button fill loading={isLoading} onClick={onClickAdd}>
					추가
				</Button>
			</ButtonGroup>
		</Drawer>
	);
}
