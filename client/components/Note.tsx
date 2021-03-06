import unified from 'unified'
import parse from 'remark-parse'
import remark2react from 'remark-react'
import ReferencesBlock from "./ReferencesBlock";
import { FC, Ref } from 'react';
import useNotes, { useNoteSettings, useSingleNote } from './useNotes';
import useNoteLayout from './useNoteLayout';
import { notePostions } from './noteLayoutReducer';
import Link from 'next/link'
const { wikiLinkPlugin } = require('remark-wiki-link');
import {INote} from '../../types'
import  NoteMarkdownLink  from './NoteMarkdownLink';
import { useMemo } from 'react';
import { Heading } from './primatives/layout';
import { forwardRef } from 'react';
import { useRouter } from 'next/router';

//find next position to open in
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
	
	let mb = `mb-4`;
	return (
		<div className={'prose note-markdown'}>
			{
				unified()
					.use(parse)
					.use(remark2react, {
						remarkReactComponents: {
							a,
							ul: ({ children }) => (
								<ul className={`${mb} list-inside list-disc`}>{children}</ul>
							),
							p: ({ children }) => (
								<p className={mb} > { children }</p>
							),
							h1: ({ children }) => (
								<Heading level={1} className={mb} > { children }</Heading>
							),
							h2: ({ children }) => (
								<Heading level={2} className={mb} > { children }</Heading>
							),
							h3: ({ children }) => (
								<Heading level={3} className={mb} > { children }</Heading>
							),
							blockquote: ({children}) => {
								return (
									<blockquote className="border-l-4 border-grey-light pl-4 italic bg-gray-100">
										{children}
									</blockquote>
								)
							}
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
		</div>
	)
	}

export const NoteTitle: React.FC<{ note: INote, className?: string }> = ({ note, className }) => (
	<h1 className={className}>{note.title}</h1>
);

export const NoteToolbar: FC<{ children: any; slug: string; title?: string }> =
	({ children, slug,title }) =>
(
	<div
		role={'toolbar'}
		aria-label={`Controls for note ${title??slug}`}
		aria-controls={`note-${slug}`}
		className={'border border-gray-500 space-y-0 text-center flex justify-center rounded-lg text-lg mb-4'}
	>
		{children}
	</div>
);

export const NoteContainer: React.FC<{
	isOpen: boolean,
	position: notePostions
}> = forwardRef((props, ref: React.Ref<HTMLDivElement>) => {
	const {
		children,
		isOpen,
		position,
	} = props;
	const { focusNote,hasNote } = useNoteLayout();
	const className = useMemo(
		() => `note-container ${isOpen ? 'note-open' : 'note-closed'} ${focusNote === position ? 'note-focus' : ''} ${hasNote(position) ? 'visible': 'invisible'} note-position-${position}`,
		[focusNote, position, isOpen]
	);

	return (
		<div
			className={className}
			ref={ref}
		>
			{children}
		</div>
	);
});
/**
 * Outermost wrapper for one note
 */
export const NoteContentWrapper: FC<{
	children: any,
	onClick?: () => void,
	slug?: string;
	id?: string;
}> = ({ children, onClick, slug, id }) => {
	return (
		<div
			id={id ? id : slug ? `note-${slug}`:''}
			className={"note-content"}
			onClick={onClick}
		>
			{children}
		</div>
	)
}

/**
 * Share button for notes
 */
const NoteShare: FC<{ note: INote }> = ({ note }) => {
	let { getNoteUrl } = useNoteSettings();
	let noteUrl = getNoteUrl(note);
	return (
		<a
			className="bg-white text-black hover:text-white hover:bg-gray-500  border-green-500 border rounded-r-lg px-4 py-2 mx-0 outline-none focus:shadow-outline"
			title={'Click To Share'}
			target={"_blank"}
			href={noteUrl}
		>
			Share
		</a>
	)
}

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
	const { setFocusNote } = useNoteLayout();
	//Note still loading? Use loading animation.
	if (!note) {
		return (
			<>
				<div className={'note-buttons'}></div>
				<NoteContentWrapper
				>
					{
						//if we have note from props, show it now.
						props.note ? (
						<>
							<NoteTitle note={props.note}
								className={'animate-pulse'}
							/>
							<NoteMarkdown
								content={props.note.content}
							/>
						</>
					) : (
							<>
								<span className="animate-pulse">Loading</span><span className="animate-ping">...</span>
							</>
					)}
				</NoteContentWrapper>
			</>
		)
	}

	if (!isOpen) {
		return (<>
			<>
				<NoteToolbar slug={note.slug} title={note.title}>
					<a
						role={'button'}
						className="bg-white text-black hover:text-white hover:bg-gray-500  border-green-500 border px-4 py-2 mx-0 outline-none focus:shadow-outline"
						title={'Click To Open'}
						onClick={(e) => {
							e.preventDefault();
							toggleBox()
						}}
						>
							Open
					</a>
				</NoteToolbar>
			</>
		</>);
	}

	let { content } = note;
    return (
        <>
			<>
				<NoteToolbar slug={note.slug} title={note.title}>
					<a
						role={'button'}
						className="bg-white text-black hover:text-white hover:bg-gray-500  border-green-500 border border-r-0 rounded-l-lg px-4 py-2 mx-0 outline-none focus:shadow-outline"
						title={`Click to ${isOpen ? 'Close' : 'Open'}`}
						onClick={(e) => {
							e.preventDefault();
							toggleBox()
						}}
					>
						{isOpen ? 'Close' : 'Open'}
					</a>
					{isLoggedIn && <Link href={`/notes/edit?note=${note.slug}`}>
							<a
								className="bg-white text-black hover:text-white hover:bg-gray-500  border-green-500 border px-4 py-2 mx-0 outline-none focus:shadow-outline"
								title={'Click To Edit'}
							>
									Edit
							</a>
						</Link>}
						<NoteShare note={note} />
				</NoteToolbar>
                {isOpen &&
					<NoteContentWrapper
						slug={note.slug}
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
						{note.references && <ReferencesBlock references={note.references} openPosition={nextPosition(position)} />}
						</>
                </NoteContentWrapper>
                }
            </>
        </>
    )
}

export default Note