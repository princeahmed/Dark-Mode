/**
 * External dependencies
 */
import classnames from 'classnames';
import { range } from 'lodash';

/**
 * Internal dependencies
 */
import HeadingLevelIcon from './heading-level-icon';
import CreateHTMLAnchorMenuItem from './copy-link-menu-item';
import icons from '../icons';

/**
 * WordPress dependencies
 */
import { __, sprintf } from '@wordpress/i18n';
import { Component, Fragment } from '@wordpress/element';
import { withSelect, withDispatch } from '@wordpress/data';
import { compose, withInstanceId, ifCondition } from '@wordpress/compose';
import { switchToBlockType } from '@wordpress/blocks';
import {
	withSpokenMessages,
	DropdownMenu,
	MenuGroup,
	MenuItem,
} from '@wordpress/components';

class HeadingLevelIndicator extends Component {
	constructor() {
		super( ...arguments );
		this.onChangeLevel = this.onChangeLevel.bind( this );
	}

	onChangeLevel( clientId, level ) {
		const { updateBlockAttributes } = this.props;

		updateBlockAttributes( clientId, {
			level: parseInt( level ),
		} );
	}

	render() {
		const {
			isActive,
			clientId,
			attributes,
			onTransform,
			updateBlockAttributes,
		} = this.props;

		const { anchor, content } = attributes;

		if ( ! isActive ) {
			return false;
		}

		let headingLevel = 2;

		if ( typeof attributes.level !== 'undefined' ) {
			headingLevel = attributes.level;
		}

		const POPOVER_PROPS = {
			className:
				'components-markdown-popover components-markdown-heading-level-indicator__popover',
			position: 'bottom left',
			focusOnMount: 'container',
		};

		const TOGGLE_PROPS = {
			tooltipPosition: 'bottom',
			children: '#'.repeat( headingLevel ),
		};

		return (
			<div
				className={ classnames(
					'markdown-heading-level-indicator',
					'level-' + headingLevel,
					{}
				) }
			>
				<DropdownMenu
					className="components-markdown-heading-level-indicator__trigger"
					icon={ null }
					label={ __( 'Change heading level', 'dark-mode' ) }
					popoverProps={ POPOVER_PROPS }
					toggleProps={ TOGGLE_PROPS }
				>
					{ ( { onClose } ) => (
						<Fragment>
							<MenuGroup>
								{ range( 1, 6 ).map( ( currentLevel ) => {
									return (
										<MenuItem
											key={ currentLevel }
											className={ classnames(
												'components-markdown-heading-level-indicator__menu-item',
												{
													'is-active':
														headingLevel ===
														currentLevel,
												}
											) }
											onClick={ () => {
												this.onChangeLevel(
													clientId,
													currentLevel
												);
												onClose();
											} }
										>
											{ sprintf(
												__(
													'Heading level %s',
													'dark-mode'
												),
												currentLevel
											) }
											{ headingLevel === currentLevel ? (
												icons.checkMark
											) : (
												<HeadingLevelIcon
													level={ currentLevel }
												/>
											) }
										</MenuItem>
									);
								} ) }
							</MenuGroup>
							<MenuGroup>
								<CreateHTMLAnchorMenuItem
									clientId={ clientId }
									anchor={ anchor }
									content={ content }
									updateBlockAttributes={
										updateBlockAttributes
									}
								/>
								<MenuItem
									onClick={ () => {
										onTransform(
											clientId,
											this.props,
											'core/paragraph'
										);
										onClose();
									} }
								>
									{ __( 'Change to paragraph', 'dark-mode' ) }
									{ icons.paragraph }
								</MenuItem>
							</MenuGroup>
						</Fragment>
					) }
				</DropdownMenu>
			</div>
		);
	}
}

export default compose( [
	withInstanceId,
	withSelect( ( select ) => ( {
		isActive: select( 'core/edit-post' ).isFeatureActive(
			'markdownWritingMode'
		),
		isEnabled: select( 'markdown-settings' ).isEditorPanelEnabled(
			'headingIndicators'
		),
	} ) ),
	withDispatch( ( dispatch ) => ( {
		updateBlockAttributes: dispatch( 'core/block-editor' )
			.updateBlockAttributes,
		onTransform( clientId, blocks, name ) {
			dispatch( 'core/block-editor' ).replaceBlocks(
				clientId,
				switchToBlockType( blocks, name )
			);
		},
	} ) ),
	ifCondition( ( props ) => {
		return props.isEnabled;
	} ),
	withSpokenMessages,
] )( HeadingLevelIndicator );
