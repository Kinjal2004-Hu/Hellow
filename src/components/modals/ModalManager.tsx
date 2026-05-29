import { NotesModal } from "./NotesModal";
import { TasksModal } from "./TasksModal";
import { CalendarModal } from "./CalendarModal";
import { AIChatModal } from "./AIChatModal";
import { MicroLearningModal } from "./MicroLearningModal";
import { BookmarksModal } from "./BookmarksModal";

export function ModalManager() {
  return (
    <>
      <NotesModal />
      <TasksModal />
      <CalendarModal />
      <AIChatModal />
      <MicroLearningModal />
      <BookmarksModal />
    </>
  );
}
