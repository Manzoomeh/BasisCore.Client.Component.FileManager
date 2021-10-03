import IFileHierarchyNode from "./IFileHierarchyNode";

export default interface IComponent {
    updateUI(node: IFileHierarchyNode): void;
    nodeAdded(node: IFileHierarchyNode): void;
    initialize(): void;
}
