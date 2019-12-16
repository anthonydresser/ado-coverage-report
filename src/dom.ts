export function clearNode(node: HTMLElement): void {
	while (node.firstChild) {
		node.removeChild(node.firstChild);
	}
}