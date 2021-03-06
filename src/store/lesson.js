import { lessonService } from '../service'
import { propositionService } from '../service'
import { questionService } from '../service'
import { translationService } from '../service'
import { bookLessonService } from '../service'
import Memento from '../misc/memento'

const state = {
    'bookLessons': [],
    'lessons': [],
    'currentLesson': null,
    'status': {
        savingLesson: false,
    },
    'lessonMemento': Memento(),
    'lessonUndoable': false,
    addingProposition: false,
    propositionSaved: false,
    propositionSaveError: false,
}

const actions = {
    updateLessons({commit}) {
        lessonService.fetchAll()
            .then((lessons) => {
                commit('lessonsUpdated', lessons)
            })
            .catch(() => {
                commit('lessonsUpdateError')
            })
    },
    updateCurrentLesson({commit}, {id}) {
        lessonService.fetchById(id)
            .then((lesson) => {
                commit('currentLessonUpdated', lesson)
            })
            .catch(() => {
                commit('currentLessonUpdateError')
            })
    },
    deleteLesson({commit, dispatch}, {id}) {
        commit('savingLesson')

        lessonService.remove({id})
            .then(() => {
                dispatch('loadAllBookLessons')
            })
            .catch(() => null)
    },
    undoCurrentLesson({commit, dispatch, state}) {
        commit('currentLessonUndone')
        state.lessonMemento.undo()
        dispatch('saveCurrentLesson')
    },
    saveCurrentLesson({commit}) {
        commit('savingLesson')

        lessonService.save(state.currentLesson)
            .then(() => commit('lessonSaved'))
            .catch(() => commit('lessonSaveError'))
    },
    saveProposition({commit, dispatch, state}, {proposition}) {
        commit('addingProposition')

        propositionService.add(proposition)
            .then(() => {
                commit('propositionSaved')
                dispatch('updateCurrentLesson', {id: state.currentLesson.id})
            })
            .catch(() => commit('propositionSaveError'))
    },
    deleteProposition({dispatch, state}, {id}) {
        propositionService.remove({id})
            .then(() => {
                dispatch('updateCurrentLesson', {id: state.currentLesson.id})
            })
            .catch(() => null)
    },
    saveQuestion({dispatch, state}, {question}) {
        questionService.add(question)
            .then(() => {
                dispatch('updateCurrentLesson', {id: state.currentLesson.id})
            })
            .catch(() => null)
    },
    deleteQuestion({dispatch, state}, {id}) {
        questionService.remove({id})
            .then(() => {
                dispatch('updateCurrentLesson', {id: state.currentLesson.id})
            })
            .catch(() => null)
    },
    saveTranslation({dispatch, state}, {translation}) {
        translationService.add(translation)
            .then(() => {
                dispatch('updateCurrentLesson', {id: state.currentLesson.id})
            })
            .catch(() => null)
    },
    deleteTranslation({dispatch, state}, {id}) {
        translationService.remove({id})
            .then(() => {
                dispatch('updateCurrentLesson', {id: state.currentLesson.id})
            })
            .catch(() => null)
    },
    loadAllBookLessons({commit}) {
        bookLessonService.fetchAll()
            .then((bookLessons) => {
                commit('bookLessonsUpdated', bookLessons)
            })
            .catch(() => {
                commit('bookLessonsUpdateError')
            })
    },
    saveBookLesson({dispatch}, {bookLesson}) {
        bookLessonService.add(bookLesson)
            .then(() => {
                dispatch('loadAllBookLessons')
            })
            .catch(() => null)
    },
    patchBookLesson({commit}, {id, data}) {
        commit('savingLesson')

        bookLessonService.patch(id, data)
            .then((bookLessons) => {
                commit('lessonSaved', bookLessons)
            })
            .catch(() => null)
    },
    deleteBookLesson({commit}, {id}) {
        commit('savingLesson')

        bookLessonService.remove({id})
            .then(() => {
                commit('removeLocalBookLesson', id)
            })
            .catch(() => null)
    },
    saveLesson({dispatch}, {lesson}) {
        lessonService.add(lesson)
            .then(() => {
                dispatch('loadAllBookLessons')
            })
            .catch(() => null)
    },
}

const mutations = {
    lessonsUpdated(state, lessons) {
        state.lessons = lessons
    },
    lessonsUpdateError(state) {
        state.lessons = []
    },
    currentLessonUpdated(state, lesson) {
        state.currentLesson = lesson
        state.lessonMemento.reset(lesson)
    },
    currentLessonUndone(state) {
        const previousLessonState = state.lessonMemento.undo()

        if (!previousLessonState) {
            return
        }

        state.currentLesson = previousLessonState
        state.lessonUndoable = state.lessonMemento.undoable()
    },
    currentLessonUpdateError(state) {
        state.currentLesson = null
    },
    savingLesson(state) {
        state.status.savingLesson = true
        state.lessonMemento.addState(state.currentLesson)
        state.lessonUndoable = state.lessonMemento.undoable()
    },
    lessonSaved(state) {
        state.status.savingLesson = false
    },
    lessonSaveError(state) {
        state.status.savingLesson = false
    },
    addingProposition(state) {
        state.addingProposition = true
        state.propositionSaved = false
        state.propositionSaveError = false
    },
    propositionSaved(state) {
        state.addingProposition = false
        state.propositionSaved = true
        state.propositionSaveError = false
    },
    propositionSaveError(state) {
        state.addingProposition = false
        state.propositionSaved = false
        state.propositionSaveError = true
    },
    bookLessonsUpdated(state, bookLessons) {
        state.bookLessons = bookLessons
    },
    bookLessonsUpdateError(state) {
        state.bookLessons = []
    },
    removeLocalBookLesson(state, id) {
        state.bookLessons = state.bookLessons.filter(e => e.id !== id)
    }
}

export const lesson = {
    namespaced: true,
    state,
    actions,
    mutations,
}
