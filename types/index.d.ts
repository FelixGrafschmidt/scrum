export {}

declare global {
	interface Task {
		name?: string,
		options?: string[]
		votes?: { [key: string]: string }
		id?: string
	}
}
