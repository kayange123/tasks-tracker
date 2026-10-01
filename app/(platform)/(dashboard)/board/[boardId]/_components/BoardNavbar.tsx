import { Board } from "@prisma/client";
import BoardTitleForm from "./boardTitleForm";
import BoardOptions from "./BoardOptions";

interface BoardNavbarProps {
  board: Board;
}

const BoardNavbar = async ({ board }: BoardNavbarProps) => {
  return (
    <div className="w-full h-14 z-50 bg-black/50 flex items-center fixed top-14 px-6 gap-x-4 text-white">
      <BoardTitleForm id={board.id} title={board.title} />
      <div className="ml-auto">
        <BoardOptions id={board.id} />
      </div>
    </div>
  );
};

export default BoardNavbar;
