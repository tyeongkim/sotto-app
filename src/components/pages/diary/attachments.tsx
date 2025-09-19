import { AttachmentFocus } from '@/components/features/attachment/focus';
import { Column } from '@/components/layout/column';
import { Container } from '@/components/layout/container';
import { Row } from '@/components/layout/row';
import { LoadingCircle } from '@/components/ui/loading-circle';
import { Typo } from '@/components/ui/typography';
import { useOverlay } from '@/hooks/use-overlay';
import { cn } from '@/lib/common';
import { decryptAttachment } from '@/lib/managers/attachment';
import { fileStorage } from '@/lib/managers/file';
import { fullHeight } from '@/styles/utils.css';
import type { BaseProps, HAS_CHILDREN } from '@/types/props';
import { message } from '@tauri-apps/plugin-dialog';
import { ImagePlus } from 'lucide-react';
import {
	type ChangeEvent,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';
import { v4 } from 'uuid';
import { DiaryContext } from './context';
import { image, input, item, list } from './styles/attachments.css';

export function DiaryAttachments() {
	const { diary } = useContext(DiaryContext);

	if (diary.readonly && diary.attachments.length === 0) {
		return null;
	}

	return (
		<Container className={list} vertical='large' horizontal='large'>
			<Row gap={8} justify='start'>
				{diary.attachments.length < 5 && !diary.readonly ? <AddPhoto /> : null}
				{diary.attachments.map((a, i) => (
					<AttachmentItem key={i.toString()} attachment={a} />
				))}
			</Row>
		</Container>
	);
}

function AddPhoto() {
	const inputRef = useRef<HTMLInputElement>(null);
	const {
		diary,
		diaryDispatch: { setAttachments },
		setIsAttachmentUpdated,
	} = useContext(DiaryContext);

	const onClick = useCallback(() => {
		if (inputRef.current) {
			inputRef.current.click();
		}
	}, []);

	const onChange = useCallback(
		async (e: ChangeEvent<HTMLInputElement>) => {
			const files = e.target.files;
			if (!files || files.length === 0) return;
			const fileList = Array.from(files).filter(
				(file) => file.size <= 3.5 * 1024 * 1024,
			);
			if (diary.attachments.length + fileList.length > 5) {
				await message('사진은 최대 5장까지 추가할 수 있어요.', {
					kind: 'error',
				});
				return;
			}
			if (fileList.length < files.length) {
				await message(
					'일부 파일이 너무 커서 추가되지 않았어요. 최대 크기는 3.5MB예요.',
				);
			}

			if (fileList.length === 0) {
				await message('유효한 파일이 선택되지 않았어요.');
				return;
			}

			const newAttachments = await Promise.all(
				fileList.map(async (file) => {
					const id = v4();
					await fileStorage.saveFile(id, file);
					return { local_id: id };
				}),
			);
			setAttachments([...newAttachments, ...diary.attachments]);
			setIsAttachmentUpdated(true);
		},
		[diary.attachments, setAttachments, setIsAttachmentUpdated],
	);

	return (
		<Item onClick={onClick}>
			<Column className={fullHeight} gap={8} align='center'>
				<ImagePlus />
				<Typo.Caption weight='medium'>사진 추가</Typo.Caption>
			</Column>
			<input
				ref={inputRef}
				className={input}
				type='file'
				accept='image/*'
				multiple
				onChange={onChange}
			/>
		</Item>
	);
}

interface AttachmentProps {
	attachment: Attachment;
}

function AttachmentItem(props: AttachmentProps) {
	const { attachment } = props;

	const [isLoading, setIsLoading] = useState(true);
	const [previewUrl, setPreviewUrl] = useState('');
	const {
		diary,
		diaryDispatch: { setAttachments },
		setIsAttachmentUpdated,
	} = useContext(DiaryContext);
	const { show: showFocus, hide: hideFocus } = useOverlay(AttachmentFocus);

	const getAttachment = useCallback(async () => {
		let url: string;

		if (diary.readonly && attachment.remote_url) {
			if (!diary.encryptedKey) {
				throw new Error('Diary is read-only and no AES key is available.');
			}

			url = await decryptAttachment(attachment.remote_url, diary.encryptedKey);
		} else {
			const saved = await fileStorage.getFile(attachment.local_id);
			if (!saved) {
				throw new Error('File not found');
			}
			const file = saved;

			url = URL.createObjectURL(file);
		}
		setPreviewUrl(url);
		setIsLoading(false);
	}, [attachment, diary]);

	const deleteAttachment = useCallback(async () => {
		if (diary.readonly) {
			throw new Error('not implemented');
		}
		await fileStorage.deleteFile(attachment.local_id);
		setAttachments(
			diary.attachments.filter((a) => a.local_id !== attachment.local_id),
		);
		setIsAttachmentUpdated(true);
		URL.revokeObjectURL(previewUrl);
		hideFocus();
	}, [
		attachment,
		diary,
		hideFocus,
		previewUrl,
		setAttachments,
		setIsAttachmentUpdated,
	]);

	const onClick = useCallback(() => {
		showFocus({ previewUrl, handleDelete: deleteAttachment });
	}, [previewUrl, showFocus, deleteAttachment]);

	useEffect(() => {
		getAttachment();
	}, [getAttachment]);

	return (
		<Item>
			{isLoading ? (
				<Column className={fullHeight} align='center'>
					<LoadingCircle />
				</Column>
			) : (
				<img
					className={image}
					src={previewUrl}
					alt='첨부 이미지 미리보기'
					draggable={false}
					onClick={onClick}
				/>
			)}
		</Item>
	);
}

interface ItemProps extends BaseProps<HAS_CHILDREN> {
	onClick?: () => unknown;
}

function Item(props: ItemProps) {
	const { className, children, onClick } = props;

	return (
		<div className={cn(item, className)} onClick={onClick}>
			{children}
		</div>
	);
}
