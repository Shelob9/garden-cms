import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react'
import ReferencesBlock from "./ReferencesBlock";
import { FC } from 'react';
import useNotes, { useSingleNote } from './useNotes';
import NoteLink from './NoteLink';
import useNoteLayout from './useNoteLayout';
import { notePostions } from './noteLayoutReducer';
import Link from 'next/link'
const { wikiLinkPlugin } = require('remark-wiki-link');
import {INote} from '../../types'


const ExternalLink = ({ href, children }) => <a href={href}>{children}</a>;

const InternalLink : FC<{
	href: string;
	children: any,
	openPosition: notePostions
	className?:string
}> = ({
	href,
	children,
	openPosition,
	className
}) => {
	let slug = href.substr('/notes/'.length);
	const { note } = useSingleNote({slug})
	const {
		openInNextPosition
	} = useNoteLayout();
	if ( note) {
		const onClick = () => {
			openInNextPosition( note.slug, openPosition)	
		}

		return <NoteLink
				onClick={onClick}
				className={className ?? 'reference'}
				slug={slug}
		>
			{children}
		</NoteLink>
	} else {
		return <ExternalLink href={href}>{children}</ExternalLink>
	}
}
//Render note to note links
export const NoteMarkdownLink: FC<{
	href: string;
	children: any,
	openPosition: notePostions
	className?:string
}> = (props) => {
	let internal = props.href.startsWith('/notes/');
	if( internal ){
		<InternalLink {...props} />
	}
	return <ExternalLink href={props.href}>{props.children}</ExternalLink>
}

const nextPosition = (position: notePostions) => {
	switch (position) {
		case "one":
			return "two";
		case "two":
			return "three"
		case "three":
		default:
			return "one";
	}
}

//Render note content, as markdwon to HTML
export const NoteMarkdown: FC<{
	content: string;
	a?: (props: { href: string; children: any }) => JSX.Element,
}> = ({ content, a }) => {
	const { allNoteLinks } = useNotes();
	a = a ? a : ({ href, children }) => <a href={href}>{children}</a>;

	return (
		<>
			{
				unified()
					.use(parse)
					.use(remark2react,{
						remarkReactComponents: {
							a
						}
					})
					.use(wikiLinkPlugin,
						{
							permalinks: allNoteLinks,
							hrefTemplate: (permalink: string) => {
								return `/notes/${permalink}`
							}
						}
					)
					//.use(doubleBrackets)
				.processSync(content).result
			}
		</>
	)
	}

const NoteTitle: React.FC<{ note: INote }> = ({ note }) => (
	<h1>{note.title}</h1>
)

//Display one note
const Note: FC<{
	note?: INote;
	slug: string;
	toggleBox: () => void;
	isOpen: boolean;
	position: notePostions,
	isLoggedIn: boolean;
}> = (props) => {
	const { slug, toggleBox, isOpen, position, isLoggedIn } = props;
	//Even if we got a note from props, get it from network/cache
	const { note } = useSingleNote({
		slug, //note
	});
	const { focusNote,setFocusNote} = useNoteLayout();
	if (!note) {
		return <div>Loading</div>
	}

	let { content } = note;
    return (
        <>
			<div
                className={`note-container ${isOpen ? 'note-open' : 'note-closed'} ${focusNote === position ? 'note-focus': ''}`}
			>
				<div className={'note-buttons'}>
					<button
						title={isOpen ? 'Collapse note' : 'Expand Note'}
						onClick={
						() => toggleBox()
					}>
						{isOpen ? '-' : '+'}
					</button>
					{isOpen &&
						 isLoggedIn && <Link
							href={isLoggedIn ? `/notes/edit?note=${encodeURIComponent(note.slug)}` : '/login'}
						>
							<a
								className={'edit-note'}
							>
								{'Edit'}
							</a>
						</Link>
						
					}
				</div>
                {isOpen &&
					<div
						className={"note-content"}
						onClick={() => setFocusNote(position)}
				>
						<NoteTitle note={note} />
						<NoteMarkdown
							content={content}
							a={(props) => (
								<NoteMarkdownLink
									{...props}
									openPosition={nextPosition(position)}
								/>)
								}
							/>
						<>
						{note.references && <ReferencesBlock references={note.references} openPosition={'one'} />}
						</>
                </div>
                }
            </div>
        </>
    )
}

export default Note