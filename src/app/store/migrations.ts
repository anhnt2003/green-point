import type { DataState, User } from '@/app/domain/types'

/** Bump when the persisted shape or seed identities change, and add a step below. */
export const DATA_VERSION = 2

const OLD_CITIZEN_ID = 'u-lananh'
const CITIZEN_ID = 'u-citizen'

/**
 * Upgrades data saved in localStorage by an older version of the app, so returning
 * visitors keep their points and history.
 */
export function migrateData(persisted: unknown, fromVersion: number): DataState {
  let state = persisted as DataState

  if (fromVersion < 2) {
    // v2: the mock citizen "Lan Anh" (u-lananh) became "Tuấn Anh" (u-citizen).
    const old = state.users?.[OLD_CITIZEN_ID]
    if (old) {
      const { [OLD_CITIZEN_ID]: _removed, ...others } = state.users
      const citizen: User = {
        ...old,
        id: CITIZEN_ID,
        name: old.name === 'Lan Anh' ? 'Tuấn Anh' : old.name,
        avatarInitials: old.avatarInitials === 'LA' ? 'TA' : old.avatarInitials,
      }
      const remap = (id: string) => (id === OLD_CITIZEN_ID ? CITIZEN_ID : id)
      state = {
        ...state,
        session: state.session ? { userId: remap(state.session.userId) } : null,
        users: { ...others, [CITIZEN_ID]: citizen },
        transactions: state.transactions.map((t) => ({ ...t, userId: remap(t.userId) })),
        loanApplications: state.loanApplications.map((l) => ({ ...l, userId: remap(l.userId) })),
      }
    }
  }

  return state
}
