import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import { usePosts } from '../../hooks/usePosts';

type ViewMode = 'month' | 'week';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const { posts } = usePosts();

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledDate);
      return postDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());

    const days = [];
    const currentDay = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      const dayPosts = getPostsForDate(currentDay);
      const isCurrentMonth = currentDay.getMonth() === currentDate.getMonth();
      const isToday = currentDay.toDateString() === new Date().toDateString();

      days.push(
        <div
          key={currentDay.toISOString()}
          className={`min-h-24 p-2 border border-gray-200 ${
            !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
          } ${isToday ? 'bg-blue-50 border-blue-200' : ''}`}
        >
          <div className="font-medium text-sm mb-1">{currentDay.getDate()}</div>
          <div className="space-y-1">
            {dayPosts.slice(0, 2).map(post => (
              <div
                key={post.id}
                className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 truncate"
              >
                {post.clientName}
              </div>
            ))}
            {dayPosts.length > 2 && (
              <div className="text-xs text-gray-500">+{dayPosts.length - 2} mais</div>
            )}
          </div>
        </div>
      );

      currentDay.setDate(currentDay.getDate() + 1);
    }

    return (
      <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="bg-gray-100 p-3 text-center text-sm font-medium text-gray-700">
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

      days.push(
        <div key={day.toISOString()} className="flex-1 min-h-96 border border-gray-200 p-3">
          <div className={`font-medium text-sm mb-3 ${isToday ? 'text-blue-600' : 'text-gray-700'}`}>
            {day.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric' })}
          </div>
          <div className="space-y-2">
            {dayPosts.map(post => (
              <div
                key={post.id}
                className="text-xs px-2 py-2 rounded bg-blue-100 text-blue-800"
              >
                <div className="font-medium">{post.clientName}</div>
                <div className="truncate">{post.content.substring(0, 30)}...</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return <div className="flex border border-gray-200 rounded-lg overflow-hidden">{days}</div>;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarIcon size={16} className="inline mr-1" />
              Mensal
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List size={16} className="inline mr-1" />
              Semanal
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-lg font-medium text-gray-900">
            {currentDate.toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric',
              ...(viewMode === 'week' && { day: 'numeric' })
            })}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigateDate('prev')}
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
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'month' ? renderMonthView() : renderWeekView()}
    </div>
  );
};