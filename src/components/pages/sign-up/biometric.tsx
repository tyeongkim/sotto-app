import { Column } from '@/components/layout/column';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button/group';
import { Content } from '@/components/ui/content';
import { ScanFace } from 'lucide-react';
import { fillHeight } from './styles/styles.css';

interface SignUpBiometricSectionProps {
	signUp: (biometricLogin: boolean) => void;
}

export function SignUpBiometricSection(props: SignUpBiometricSectionProps) {
	const { signUp } = props;

	return (
		<Column className={fillHeight}>
			<Content
				icon={<ScanFace size={48} />}
				title='생체 인증을 사용할까요?'
				description='Face ID 또는 Touch ID로 앱을 이용할 수 있어요'
			/>
			<ButtonGroup bottomSafeAreaPadding>
				<Button fill variant='secondary' onClick={() => signUp(false)}>
					아니오
				</Button>
				<Button fill onClick={() => signUp(true)}>
					예
				</Button>
			</ButtonGroup>
		</Column>
	);
}
