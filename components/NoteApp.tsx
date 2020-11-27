
import React,{useEffect,useState,useMemo} from 'react'

import Layout from '../components/Layout';
import Note from '../components/Note';

let defaultNote = '';
let allNotes = [
    {
      id: 1,
      content: '# Hi Roy \n One **One** [two](/two) \n ## H2 \n Arms \n ## H22 \n a',
      title: 'Note One ',
    },
    {
      id: 2,
      content: '# Roots \n Two **One**',
      title: 'Note Two',
    },


  
  ];

const addNoteAction = (notePosition) => {
  return {
    type: 'addNote',
    notePosition
  }
}
const removeNoteAction = (notePosition) => {
  return {
    type: 'removeNote',
    notePosition
  }
}

let intitalState = {
  one: {
    noteId: 1,
    open: true,
  },
  two: {
    noteId: 2,
    open:false,
  }

}
const noteReducer = (state, action) => {
  switch (action.type) {
    case 'collapseNote':
      return {
        ...state,
        [action.notePosition]: {
          ...state[action.notePosition],
          open:false
        }
      }
      break;
    case 'expandNote':
      return {
        ...state,
        [action.notePosition]: {
          ...state[action.notePosition],
          open: true
        }
      };
      break;

      case 'addNote':
      break;
    
      case 'removeNote':
      break;
    case 'reset': 
    default:
      return state;
      break;
  }
}
const NoteApp = () => {
  
  const [currentNotes, dispatchNotesAction] = React.useReducer(
    noteReducer,
    intitalState
  );

  const getNote = (noteId) => {
    return allNotes.find(note => noteId === note.id);
  }

  const noteOne = useMemo(() => {
    if (currentNotes.one) {
      return getNote(currentNotes.one.noteId)

    }
    return undefined;
  }, [currentNotes]);

  const noteTwo = useMemo(() => {
    if (currentNotes.two) {
      return getNote(currentNotes.two.noteId)

    }
    return undefined;
  }, [currentNotes]);

  const noteThree = useMemo(() => {
    if (currentNotes.three) {
      return getNote(currentNotes.three.noteId)

    }
    return undefined;
  }, [currentNotes]);

  const isNoteOpen = (notePosition) => currentNotes.hasOwnProperty(notePosition) &&currentNotes[notePosition].open;
  
  const toggleBox = (notePosition, note) => {
   
    if (! isNoteOpen(notePosition)) {
      dispatchNotesAction({
        notePosition,
        type:'expandNote'
      });
    } else {
      dispatchNotesAction({
        notePosition,
        type:'collapseNote'
      });

    }
  }



  return (
      <>
      <Layout >
        <Note
          content={noteOne ? noteOne.content : ''}
          position={'one'}
          isOpen={isNoteOpen('one') }
          onCollapseButton={() => toggleBox('one',noteOne)}
        />
        {noteTwo && <Note
          content={noteTwo.content}
          position={'two'}
          isOpen={isNoteOpen('two')}
          onCollapseButton={() => toggleBox('two',noteTwo)}
        />}
        {noteThree && <Note
          content={noteThree.content}
          position={'three'}
          isOpen={isNoteOpen('three')}
          onCollapseButton={() => toggleBox('three',noteThree)}

        />}
      </Layout>
      </>
    )
  
}

export default NoteApp;