'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import {VelocityTransitionGroup} from 'velocity-react';
import { ContextMenuProvider } from 'kt-contexify';

import NodeHeader from './header';

class TreeNode extends React.Component {
    constructor() {
        super();

        this.onClick = this.onClick.bind(this);
    }

    onClick() {
        const {node, onToggle} = this.props;
        const {toggled} = node;

        if (onToggle) {
            onToggle(node, !toggled);
        }
    }

    animations() {
        const {animations, node} = this.props;

        if (animations === false) {
            return false;
        }

        const anim = Object.assign({}, animations, node.animations);
        return {
            toggle: anim.toggle(this.props),
            drawer: anim.drawer(this.props)
        };
    }

    decorators() {
        // Merge Any Node Based Decorators Into The Pack
        const {decorators, node} = this.props;
        let nodeDecorators = node.decorators || {};

        return Object.assign({}, decorators, nodeDecorators);
    }

    render() {
        const {style} = this.props;
        const decorators = this.decorators();
        const animations = this.animations();

        return (
            <li ref={ref => this.topLevelRef = ref}
                style={style.base}>
                {this.renderHeader(decorators, animations)}

                {this.renderDrawer(decorators, animations)}
            </li>
        );
    }

    renderDrawer(decorators, animations) {
        const {node: {toggled}} = this.props;

        if (!animations && !toggled) {
            return null;
        } else if (!animations && toggled) {
            return this.renderChildren(decorators, animations);
        }

        const {animation, duration, ...restAnimationInfo} = animations.drawer;
        return (
            <VelocityTransitionGroup {...restAnimationInfo}
                                     ref={ref => this.velocityRef = ref}>
                {toggled ? this.renderChildren(decorators, animations) : null}
            </VelocityTransitionGroup>
        );
    }

    renderHeader(decorators, animations) {
        const {node, style, contextMenuId, projectName } = this.props;
        if(contextMenuId === false) {
            return (
                <NodeHeader animations={animations}
                            decorators={decorators}
                            node={Object.assign({}, node)}
                            onClick={this.onClick}
                            style={style}/>
            );
        } else {
            let menu;
            const extensions = node.name.split('.');
            const extensionOne = extensions[1];
            const extensionTwo = extensions[2];
            let fileExtension = 'txt';

            if(extensionOne !== undefined) {
                fileExtension = extensionOne.toLowerCase();
            }

            if(extensionTwo !== undefined) {
                fileExtension = `${extensionOne}${extensionTwo}`.toLowerCase();
            }
            if (projectName === node.name) {
                menu = 'project';
            } else if (node.children !== null) {
                menu = 'folder';
            } else {
                if (fileExtension === 'html' || fileExtension === 'htmldl' || fileExtension === 'htm' || fileExtension === 'htmdl') {
                    if(node.Path.startsWith('/__components')){
                        menu = 'component';
                    } else {
                        menu = 'pages';
                    }
                } else {
                    menu = 'assets';
                }
            }
            return (
                <ContextMenuProvider id={contextMenuId[menu]} node={Object.assign({}, node)}>
                    <NodeHeader animations={animations}
                                decorators={decorators}
                                node={Object.assign({}, node)}
                                onClick={this.onClick}
                                style={style}/>
                </ContextMenuProvider>
            );
        }
    }

    renderChildren(decorators) {
        const {animations, decorators: propDecorators, node, style, contextMenuId, projectName} = this.props;

        if (node.loading) {
            return this.renderLoading(decorators);
        }

        let children = node.children;
        if (!Array.isArray(children)) {
            children = children ? [children] : [];
        }

        return (
            <ul style={style.subtree}
                ref={ref => this.subtreeRef = ref}>
                {children.map((child, index) => <TreeNode {...this._eventBubbles()}
                                                          animations={animations}
                                                          decorators={propDecorators}
                                                          key={child.id || index}
                                                          node={child}
                                                          style={style}
                                                          contextMenuId={contextMenuId}
                                                          projectName={projectName}/>
                )}
            </ul>
        );
    }

    renderLoading(decorators) {
        const {style} = this.props;

        return (
            <ul style={style.subtree}>
                <li>
                    <decorators.Loading style={style.loading}/>
                </li>
            </ul>
        );
    }

    _eventBubbles() {
        const {onToggle} = this.props;

        return {
            onToggle
        };
    }
}

TreeNode.propTypes = {
    style: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    decorators: PropTypes.object.isRequired,
    animations: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool
    ]).isRequired,
    onToggle: PropTypes.func
};

export default TreeNode;
