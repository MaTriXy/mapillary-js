import { NavigationEdgeData } from "./NavigationEdgeData";

/**
 * Interface that describes the properties for a
 * navigation edge from a source node to a
 * target node.
 *
 * @interface NavigationEdge
 */
export interface NavigationEdge {
    /**
     * The key of the source node.
     */
    source: string;

    /**
     * The key of the target node.
     */
    target: string;

    /**
     * Additional data describing properties of the edge.
     */
    data: NavigationEdgeData;
}
