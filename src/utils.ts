type LogStatus =
  | 'State Update'
  | 'New Selected State'
  | 'No New Selected State'
  | 'Initial Render'

export const debugLogger = <State>({
  name,
  prevState,
  nextState,
  listeners,
  status,
}: {
  name: string
  prevState: State
  nextState: State
  listeners: number
  status: LogStatus
}) => {
  console.group(`[${name}] ${status}`)
  console.log('Prev:', prevState)
  console.log('Next:', nextState)
  console.log('Listeners:', listeners)
  console.groupEnd()
}
