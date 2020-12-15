import NoteApp from "../../components/NoteApp";
import { NoteLayoutProvider } from "../../components/useNoteLayout";
import { NotesProvider } from "../../components/useNotes";
import useIsLoggedInAuthorized from "../../hooks/useIsLoggedAuthorized";
import { FC } from "react";
import { INote } from "../../../types";

import { NextSeo } from 'next-seo';
import { useRouter } from "next/router";
import { useMemo } from "react";
import { noteApiServicefactory } from '../../../server/services/serviceFactories'

const NoteSeo: FC<{ note: INote }> = ({ note })=> {
  let description = note.content ? note.content.substring(0, 240) : '';
  return (
    <NextSeo
        title={note.title}
        description={description}
        //canonical="https://www.canonical.ie/"
        openGraph={{
          //url: 'https://www.url.ie/a',
          title: note.title,
          description
        }}
      />
  )

}

const Page: FC<
  { note?: INote;slug?:string }
> = ({  note,slug }) => {
  const { isLoggedIn } = useIsLoggedInAuthorized();
  const { query } = useRouter();
  let noteOne = useMemo(() => {
    if (slug) {
      return slug;
    }
    return query.slug as string ?? 'digital-garden-builder'
  }, [query,slug]);
  let noteTwo = useMemo(() =>query.noteTwo as string ?? undefined, [query]);
  let noteThree = useMemo(() => query.noteThree as string ?? undefined, [query]);
  return (
      <>
        {note && <NoteSeo note={note} />}
        <NotesProvider>
          <NoteLayoutProvider
            noteSlug={noteOne}
          >
            <NoteApp
              isLoggedIn={isLoggedIn}
              noteOneSlug={noteOne}
              noteTwoSlug={noteTwo}
              noteThreeSlug={noteThree}
            />
         </NoteLayoutProvider>
        </NotesProvider> 
      </>
    )
    
  }
// This function gets called at build time
//Tells next.js which notes to generate files for
export async function getStaticPaths() {
  let authToken = process.env.GITHUB_API_TOKEN;
  let notesApi = await noteApiServicefactory(authToken);
  let noteIndex = notesApi.noteIndex
  const paths = noteIndex.map(({ slug}) => ({
    params: { slug },
  }))
  return { paths, fallback: false }
}

// This also gets called at build time
//Tells next.js which note to generate with
export async function getStaticProps({ params }) {
  const {slug} = params
  let authToken = process.env.GITHUB_API_TOKEN;
  let notesApi = await noteApiServicefactory(authToken);
  const note = await notesApi.fetchNote(slug);

  // Pass post data to the page via props
  return { props: { note,slug } }
}


export default Page;


