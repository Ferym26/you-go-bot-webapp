// Обработчик для создания новой опции при потере фокуса
export const handleBlur = (event, model) => {
	const value = event.target.value?.trim();
	if (!value) return;

	// Проверяем, существует ли уже такая опция
	const exists = places.some(place =>
		place.value.toLowerCase() === value.toLowerCase() ||
		place.label.toLowerCase() === value.toLowerCase()
	);

	if (!exists) {
		// Если опции нет, добавляем её
		if (model === 'from') {
			placeFrom.value = value;
		} else {
			placeTo.value = value;
		}
	}
};
