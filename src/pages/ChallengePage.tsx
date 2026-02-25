import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { challengeApi } from "../lib/api";

interface Challenge {
  id: string;
  name: string;
  description: string;
  minSubmissionsPerDay: number;
  difficultyFilter: string[] | null;
  uniqueProblemConstraint: boolean;
  penaltyAmount: number;
  startDate: string;
  endDate: string;
  status: string;
  ownerId: string;
  createdAt: string;
}

export default function ChallengesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const difficulty = searchParams.get("difficulty") || "";
  const status = searchParams.get("status") || "";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(search);

  const pageSize = 6;

  // ==============================
  // Load Data
  // ==============================
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await challengeApi.getAll();
        setChallenges(res.success && res.data ? res.data : []);
      } catch (err) {
        console.error(err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ==============================
  // Sync input when URL changes
  // ==============================
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // ==============================
  // Debounced search
  // ==============================
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);

      if (searchInput) {
        params.set("search", searchInput);
      } else {
        params.delete("search");
      }

      setSearchParams(params);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ==============================
  // Difficulty rank helper
  // ==============================
  const getDifficultyRank = (c: Challenge) => {
    const order = { Easy: 1, Medium: 2, Hard: 3 };
    if (!c.difficultyFilter?.length) return 0;
    return Math.max(
      ...c.difficultyFilter.map(
        (d) => order[d as keyof typeof order] || 0
      )
    );
  };

  // ==============================
  // Filter + Stable Sort
  // ==============================
  const processed = useMemo(() => {
    let data = [...challenges];

    if (difficulty) {
      data = data.filter((c) =>
        c.difficultyFilter?.includes(difficulty)
      );
    }

    if (status) {
      data = data.filter((c) => c.status === status);
    }

    if (search) {
      data = data.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) => {
      switch (sort) {
        case "newest": {
          const diff =
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime();
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        case "oldest": {
          const diff =
            new Date(a.createdAt).getTime() -
            new Date(b.createdAt).getTime();
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        case "difficulty": {
          const diff = getDifficultyRank(a) - getDifficultyRank(b);
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        case "endDate": {
          const diff =
            new Date(a.endDate).getTime() -
            new Date(b.endDate).getTime();
          if (diff !== 0) return diff;
          return a.name.localeCompare(b.name);
        }
        default:
          return 0;
      }
    });

    return data;
  }, [challenges, difficulty, status, sort, search]);

  // ==============================
  // Pagination
  // ==============================
  const totalPages = Math.ceil(processed.length / pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const paginated = processed.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // ==============================
  // Update URL
  // ==============================
  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) params.set(key, value);
    else params.delete(key);

    setSearchParams(params);
    setPage(1);
  };

  const resetFilters = () => {
    setSearchParams({});
    setSearchInput("");
    setPage(1);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Challenges</h1>

      <div className="flex flex-wrap gap-4">
        <select
          value={difficulty}
          onChange={(e) => updateParam("difficulty", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>

        <select
          value={status}
          onChange={(e) => updateParam("status", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="Upcoming">Upcoming</option>
        </select>

        <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="difficulty">Difficulty</option>
          <option value="endDate">End Date</option>
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={resetFilters}
          className="border px-4 py-2 rounded bg-gray-100"
        >
          Reset
        </button>
      </div>

      <div className="grid gap-4">
        {paginated.map((c) => (
          <div key={c.id} className="border p-4 rounded shadow-sm">
            <h2 className="font-semibold">{c.name}</h2>
            <p>Status: {c.status}</p>
            <p>
              Difficulty:{" "}
              {c.difficultyFilter?.join(", ") || "Any"}
            </p>
            <p>
              Ends: {new Date(c.endDate).toLocaleDateString()}
            </p>
          </div>
        ))}

        {processed.length === 0 && <p>No challenges found.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border px-3 py-1 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}