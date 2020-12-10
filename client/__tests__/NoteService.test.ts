import { INote } from './../components/Note'
import NoteService from '../NoteService'
import { noteIndex } from 'NotesApiService'

const item = (slug: string) => {
	return {
		slug,
		path: `/notes/${slug}.md`,
		name: `${slug}.md`,
		apiUrl: `/api/notes/${slug}`,
		url: `/notes/${slug}.md`,
	}
}
describe('NoteService', () => {
	let notes: noteIndex = [item('eleven'), item('three'), item('seven')]
	test('Sets and gets notes', () => {
		let service = new NoteService()
		service.setNotes(notes)
		expect(notes).toEqual(service.getNotes())
	})

	test('Get note by slug', () => {
		let service = new NoteService()
		service.setNotes(notes)
		expect(service.getNoteBySlug('three').slug).toEqual('three')
	})
})