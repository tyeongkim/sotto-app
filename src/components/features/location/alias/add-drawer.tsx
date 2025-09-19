import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Drawer } from '@/components/ui/drawer';
import { DrawerTitle } from '@/components/ui/drawer/title';
import { Input } from '@/components/ui/input';
import { InputField } from '@/components/ui/input/field';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { log } from '@/lib/log';
import { locationManager } from '@/lib/managers/location';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback, useState } from 'react';

export function LocationAliasAddDrawer(props: OverlayProps) {
	const { close } = props;

	const [name, setName] = useState('');
	const [address, setAddress] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const onClickAdd = useCallback(async () => {
		if (!name || !address) {
			await message('모든 항목을 입력해 주세요.');
			return;
		}

		setIsLoading(true);
		try {
			await locationManager.addAlias(name, address);
			close();
		} catch (error) {
			log('error', 'Failed to add alias:', error);
			await message('별칭 추가에 실패했어요.');
		} finally {
			setIsLoading(false);
		}
	}, [name, address, close]);

	return (
		<Drawer close={close}>
			<DrawerTitle>다른 별칭 추가</DrawerTitle>
			<InputField label='이름'>
				<Input placeholder='이름 입력' value={name} onValue={setName} />
			</InputField>
			<InputField label='주소'>
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
