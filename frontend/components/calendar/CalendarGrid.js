'use client';

import { getDaysInMonthGrid, DIAS_SEMANA, getActivitiesForDay } from '@/lib/utils/dateUtils';

export default function CalendarGrid({ year, month, activities, onDayClick, onActivityClick }) {
    const days = getDaysInMonthGrid(year, month);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header de días de la semana */}
            <div className="grid grid-cols-7 bg-primary">
                {DIAS_SEMANA.map((dia) => (
                    <div
                        key={dia}
                        className="text-center py-3 text-white font-semibold text-sm border-r border-primary-light last:border-r-0"
                    >
                        {dia}
                    </div>
                ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 auto-rows-fr">
                {days.map((day, index) => {
                    const dayActivities = day ? getActivitiesForDay(activities, day) : [];
                    const isToday = day && new Date().toDateString() === day.toDateString();

                    return (
                        <div
                            key={index}
                            className={`min-h-[100px] border-r border-b border-gray-200 p-2 
                ${!day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'} 
                ${isToday ? 'ring-2 ring-primary ring-inset' : ''}
                last:border-r-0`}
                            onClick={() => day && onDayClick && onDayClick(day)}
                        >
                            {day && (
                                <>
                                    {/* Número del día */}
                                    <div
                                        className={`text-right mb-1 ${isToday
                                            ? 'bg-primary text-white rounded-full w-7 h-7 flex items-center justify-center ml-auto font-bold'
                                            : 'text-gray-700 font-semibold'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </div>

                                    {/* Actividades del día */}
                                    <div className="space-y-1">
                                        {dayActivities.slice(0, 3).map((activity) => (
                                            <div
                                                key={activity.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onActivityClick && onActivityClick(activity);
                                                }}
                                                className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{ backgroundColor: activity.categoria_color }}
                                            >
                                                <div className="font-medium text-black line-clamp-2">
                                                    {activity.hora && <span className="mr-1">{activity.hora}</span>}
                                                    {activity.actividad}
                                                </div>
                                            </div>
                                        ))}
                                        {dayActivities.length > 3 && (
                                            <div className="text-xs text-gray-500 font-medium pl-1">
                                                +{dayActivities.length - 3} más
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}