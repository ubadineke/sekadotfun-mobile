import { BaseButton } from '@/components/solana/base-button'
import { useWalletUi } from '@/components/solana/use-wallet-ui'

export function WalletUiButtonConnect({ label = 'Connect' }: { label?: string }) {
  const { connect } = useWalletUi()

  return <BaseButton label={label} onPress={() => connect()} />
}
