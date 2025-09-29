import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Filter,
  Facebook,
  Instagram,
  X,
} from "lucide-react";
import { usePosts } from "../../hooks/usePosts";
import { useAuth } from "../../contexts/AuthContext";
import { GroupedPost } from "../../types";

type ViewMode = "month" | "week";

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [selectedPost, setSelectedPost] = useState<GroupedPost | null>(null);

  const { groupedPosts } = usePosts();
  const { selectedClients, selectedClientFilter, setSelectedClientFilter } =
    useAuth();

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const getPostsForDate = (date: Date) => {
    return groupedPosts.filter((post) => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const toggleDateExpansion = (dateString: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(dateString)) {
      newExpanded.delete(dateString);
    } else {
      newExpanded.add(dateString);
    }
    setExpandedDates(newExpanded);
  };

  const renderPostCard = (post: GroupedPost, isExpanded: boolean = false) => (
    <div
      key={post.id}
      onClick={() => setSelectedPost(post)}
      className={`text-xs px-2 py-2 rounded bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200 transition-colors ${
        isExpanded ? "mb-2" : "mb-1"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1">
          {post.avatar && (
            <img
              src={post.avatar}
              alt={post.displayName || post.clientName}
              className="w-4 h-4 rounded-full"
            />
          )}
          <span className="font-medium truncate">
            {post.displayName || post.clientName}
          </span>
        </div>
        <div className="flex space-x-1">
          <Facebook
            size={12}
            className={
              post.publishedChannels.includes("facebook")
                ? "text-blue-600"
                : "text-gray-300"
            }
          />
          <Instagram
            size={12}
            className={
              post.publishedChannels.includes("instagram")
                ? "text-pink-600"
                : "text-gray-300"
            }
          />
        </div>
      </div>
      {isExpanded && (
        <div className="mt-1">
          <p className="text-xs text-gray-600 line-clamp-2">{post.content}</p>
          <div className="mt-1 text-xs text-gray-500">
            {new Date(post.scheduledDate).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderMonthView = () => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayPosts = getPostsForDate(currentDay);
      const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
      const isToday = currentDay.toDateString() === new Date().toDateString();
      const dateString = currentDay.toDateString();
      const isExpanded = expandedDates.has(dateString);

      days.push(
        <div
          key={currentDay.toISOString()}
          className={`min-h-24 p-2 border border-gray-200 ${
            !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white"
          } ${isToday ? "bg-blue-50 border-blue-200" : ""} ${
            isExpanded ? "row-span-2" : ""
          }`}
        >
          <div className="font-medium text-sm mb-1">{currentDay.getDate()}</div>
          <div className="space-y-1">
            {isExpanded ? (
              dayPosts.map((post) => renderPostCard(post, true))
            ) : (
              <>
                {dayPosts.slice(0, 2).map((post) => renderPostCard(post))}
                {dayPosts.length > 2 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDateExpansion(dateString);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    +{dayPosts.length - 2} mais
                  </button>
                )}
              </>
            )}
            {isExpanded && dayPosts.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDateExpansion(dateString);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Recolher
              </button>
            )}
          </div>
        </div>
      );

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div
            key={day}
            className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700"
          >
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      const dayPosts = getPostsForDate(day);
      const isToday = day.toDateString() === new Date().toDateString();
      const dateString = day.toDateString();
      const isExpanded = expandedDates.has(dateString);

      days.push(
        <div
          key={day.toISOString()}
          className="flex-1 min-h-96 border border-gray-200 p-3"
        >
          <div
            className={`font-medium text-sm mb-3 ${
              isToday ? "text-blue-600" : "text-gray-700"
            }`}
          >
            {day.toLocaleDateString("pt-BR", {
              weekday: "short",
              day: "numeric",
            })}
          </div>
          <div className="space-y-2">
            {isExpanded ? (
              dayPosts.map((post) => renderPostCard(post, true))
            ) : (
              <>
                {dayPosts.slice(0, 3).map((post) => renderPostCard(post))}
                {dayPosts.length > 3 && (
                  <button
                    onClick={() => toggleDateExpansion(dateString)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                  >
                    +{dayPosts.length - 3} mais
                  </button>
                )}
              </>
            )}
            {isExpanded && dayPosts.length > 0 && (
              <button
                onClick={() => toggleDateExpansion(dateString)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Recolher
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex border border-gray-200 rounded-lg overflow-hidden">
        {days}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "month"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <CalendarIcon size={16} className="inline mr-1" />
              Mensal
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List size={16} className="inline mr-1" />
              Semanal
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Filtro de cliente */}
          <div className="relative">
            <select
              value={selectedClientFilter || ""}
              onChange={(e) => setSelectedClientFilter(e.target.value || null)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos os clientes</option>
              {selectedClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.displayName || client.name}
                </option>
              ))}
            </select>
            <Filter
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
          </div>

          <div className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString("pt-BR", {
              month: "long",
              year: "numeric",
              ...(viewMode === "week" && { day: "numeric" }),
            })}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateDate("prev")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Hoje
            </button>
            <button
              onClick={() => navigateDate("next")}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "month" ? renderMonthView() : renderWeekView()}

      {/* Modal de detalhes do post */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {selectedPost.avatar && (
                  <img
                    src={selectedPost.avatar}
                    alt={selectedPost.displayName || selectedPost.clientName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedPost.displayName || selectedPost.clientName}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Facebook
                      size={16}
                      className={
                        selectedPost.publishedChannels.includes("facebook")
                          ? "text-blue-600"
                          : "text-gray-300"
                      }
                    />
                    <Instagram
                      size={16}
                      className={
                        selectedPost.publishedChannels.includes("instagram")
                          ? "text-pink-600"
                          : "text-gray-300"
                      }
                    />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Mídia
                </h3>
                <img
                  src={selectedPost.media[0]?.url}
                  alt="Post media"
                  className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                />
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Legenda
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">
                    Data de Publicação:
                  </span>
                  <p className="text-gray-900">
                    {new Date(selectedPost.scheduledDate).toLocaleString(
                      "pt-BR"
                    )}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Status:</span>
                  <p className="text-gray-900">{selectedPost.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
