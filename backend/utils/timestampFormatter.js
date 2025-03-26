export function parseTimestamp(seconds) {
	const date = new Date(seconds * 1000)

	// Форматируем как нужно
	return date.toLocaleDateString('ru', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		// hour: '2-digit',
		// minute: '2-digit',
	})
}
