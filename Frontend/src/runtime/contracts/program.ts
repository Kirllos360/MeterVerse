export enum ProgramState {
  REGISTERED = "registered",
  MOUNTED = "mounted",
  INITIALIZED = "initialized",
  ACTIVE = "active",
  DEACTIVATED = "deactivated",
  DESTROYED = "destroyed",
}

export interface ProgramMetadata {
  id: string
  title: string
  titleAr?: string
  version: string
  description: string
  category: string
  icon?: string
  supportsSplitView: boolean
  supportsPopout: boolean
  supportsMinimize: boolean
  supportsMultiple: boolean
  estimatedMemory: number
  requiredPermissions: string[]
  canSuspend: boolean
  canDestroy: boolean
  preserveScroll: boolean
  preserveState: boolean
}

export interface MountContext {
  container: HTMLElement
  slotId: string
}

export interface MountResult {
  success: boolean
}

export interface ProgramConfig {
  id: string
  metadata: ProgramMetadata
  initialData?: Record<string, unknown>
}

export interface InitializeResult {
  success: boolean
}

export interface ActivateOptions {
  focus?: boolean
}

export interface ActivateResult {
  success: boolean
}

export interface DeactivateOptions {
  preserveState?: boolean
}

export interface DeactivateResult {
  success: boolean
}

export interface SuspendedState {
  programId: string
  state: ProgramState
  customState?: Record<string, unknown>
  scrollPosition?: { x: number; y: number }
  timestamp: number
}

export interface ResumeResult {
  success: boolean
}

export interface ProgramLifecycle {
  mount(context: MountContext): Promise<MountResult>
  initialize(config: ProgramConfig): Promise<InitializeResult>
  activate(options?: ActivateOptions): Promise<ActivateResult>
  deactivate(options?: DeactivateOptions): Promise<DeactivateResult>
  suspend(): Promise<SuspendedState>
  resume(state: SuspendedState): Promise<ResumeResult>
  destroy(): Promise<void>
}

export interface ProgramLifecycleEvents {
  onMount?(program: ProgramContract, context: MountContext): void
  onInitialize?(program: ProgramContract, config: ProgramConfig): void
  onActivate?(program: ProgramContract): void
  onDeactivate?(program: ProgramContract): void
  onSuspend?(program: ProgramContract, state: SuspendedState): void
  onResume?(program: ProgramContract, state: SuspendedState): void
  onDestroy?(program: ProgramContract): void
  onError?(program: ProgramContract, error: RuntimeError): void
  onStateChange?(program: ProgramContract, from: ProgramState, to: ProgramState): void
}

export interface RuntimeError {
  code: string
  message: string
  stack?: string
  programId?: string
}

export interface ProgramRegistration {
  id: string
  metadata: ProgramMetadata
  create(host: ProgramHost): ProgramContract
  onRegister?(context: RegistrationContext): Promise<void>
  onUnregister?(context: RegistrationContext): Promise<void>
  dependencies?: string[]
  provides?: string[]
  requires?: string[]
}

export interface RegistrationContext {
  runtime: import("./runtime").RuntimeContext
}

export interface ProgramContract {
  readonly id: string
  readonly metadata: ProgramMetadata
  state: ProgramState
  readonly lifecycle: ProgramLifecycle
  readonly host: ProgramHost
  render(container: HTMLElement): Promise<void>
  destroy(): Promise<void>
}

export interface ProgramHost {
  readonly programId: string
  readonly context: import("./runtime").RuntimeContext
  setTitle(title: string): void
  setIcon(icon: string): void
  setBadge(count?: number): void
  setDirty(dirty: boolean): void
  requestFocus(): Promise<boolean>
  close(): Promise<void>
  minimize(): Promise<void>
  navigate(target: NavigationTarget): Promise<void>
  openProgram(programId: string): Promise<ProgramContract>
}

export interface NavigationTarget {
  programId?: string
  route?: string
  params?: Record<string, string>
}

export type Unsubscribe = () => void
