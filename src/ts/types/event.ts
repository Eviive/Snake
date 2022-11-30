export interface EventConfig {
	target: EventTarget;
	type: string;
	handler: (e: Event) => void;
}