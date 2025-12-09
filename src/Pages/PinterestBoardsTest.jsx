import React, { useEffect, useState } from "react";
import { useAuth } from "../Components/AuthContext";
import { BASE_URL } from "../Configuration/Config";

export default function PinterestBoardsTest() {
  const [boards, setBoards] = useState([]);
  const { authFetch } = useAuth();
 
  useEffect(() => {
    const loadBoards = async () => {
      try {
        const response = await authFetch(
          `${BASE_URL}/pinterest/boards`
        );
        const data = await response.json();

        console.log("Boards:", data);

        // Pinterest returns boards in data.items
        if (Array.isArray(data.items)) {
          setBoards(data.items);
        } else {
          setBoards([]);
        }

      } catch (err) {
        console.error("Error loading boards:", err);
      }
    };

    loadBoards();
  }, []);

  return (
    <div className="p-4 theme-bg-primary theme-text-primary">
      <h1 className="text-xl mb-4">Pinterest Boards Test</h1>

      {boards.length === 0 && <div>No boards found</div>}

      {boards.length > 0 && (
        <ul className="space-y-2">
          {boards.map((b) => (
            <li key={b.id} className="p-3 rounded theme-bg-secondary">
              {b.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}