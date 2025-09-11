import { Container } from '@/components/layout/container';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Drawer } from '@/components/ui/drawer';
import { DrawerTitle } from '@/components/ui/drawer/title';
import { Input } from '@/components/ui/input';
import type { OverlayProps } from '@/components/ui/overlay/types';
import { log } from '@/lib/log';
import { apiClient } from '@/lib/managers/http';
import { message } from '@tauri-apps/plugin-dialog';
import { useCallback, useState } from 'react';

export function MyProfileChangeNameDrawer(props: OverlayProps) {
	const { close } = props;

	const [name, setName] = useState(localStorage.getItem('name') || '');

	const onClickChange = useCallback(async () => {
		const prevName = localStorage.getItem('name');
		if (prevName === name) {
			close();
			return;
		}

		if (!/^[a-zA-Z\s]+$/.test(name)) {
			await message('이름은 영문자와 공백만 사용할 수 있어요.', {
				kind: 'error',
			});
			close();
			return;
		}

		try {
			await apiClient.patch('/users/me', {
				name,
			});
			localStorage.setItem('name', name);
		} catch (error) {
			await message('이름 변경에 실패했어요.');
			log('error', 'Failed to change name', error);
			if (prevName) {
				localStorage.setItem('name', prevName);
				setName(prevName);
			}
		} finally {
			close();
		}
	}, [name, close]);

	return (
		<Drawer {...props}>
			<DrawerTitle>이름 변경</DrawerTitle>
			<Container vertical='small'>
				<Input placeholder='새 이름' value={name} onValue={setName} />
			</Container>
			<ButtonGroup>
				<Button fill onClick={onClickChange} disabled={!name}>
					변경
				</Button>
			</ButtonGroup>
		</Drawer>
	);
}
