import { message } from '@tauri-apps/plugin-dialog';
import { wait } from './common';
import { log } from './log';
import { diaryManager } from './managers/diary';
import { fileStorage } from './managers/file';
// import { friendManager } from './managers/friend';
// import { apiClient } from './managers/http';
import { locationManager } from './managers/location';
import { storageClient } from './managers/storage';

export async function processSignIn(pin: string) {
	await storageClient.init(pin);
	await diaryManager.init();
	await locationManager.init();
	await fileStorage.init();
	await wait(500);
}

export async function resetApp() {
	try {
		await message('전시 망치지 말고 가서 다른 작품이나 보러가십쇼.');
		throw new Error('Reset app is disabled in current build');

		// friendManager.clear();
		// await diaryManager.clear();
		// await fileStorage.clear();
		// await apiClient.delete('/users/me');
		// await storageClient.clear();
	} catch (error) {
		await message(
			'모든 일기 삭제 및 로그아웃에 실패했습니다. 다시 시도하지 마세요.',
		);
		log('error', 'Failed to delete all diaries and log out', error);
		throw error;
	}
}
