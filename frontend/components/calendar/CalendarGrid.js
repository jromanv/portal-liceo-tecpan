'use client';

import { getDaysInMonthGrid, DIAS_SEMANA, getActivitiesForDay } from '@/lib/utils/dateUtils';

export default function CalendarGrid({ year, month, activities, onDayClick, onActivityClick }) {
    const days = getDaysInMonthGrid(year, month);

    // Abreviaturas para móvil
    const DIAS_ABREV = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header de días de la semana */}
            <div className="grid grid-cols-7 bg-primary">
                {DIAS_SEMANA.map((dia, index) => (
                    <div
                        key={dia}
                        className="text-center py-2 md:py-3 text-white font-semibold text-xs md:text-sm border-r border-primary-light last:border-r-0"
                    >
                        {/* Mostrar abreviatura en móvil, nombre completo en tablet+ */}
                        <span className="md:hidden">{DIAS_ABREV[index]}</span>
                        <span className="hidden md:inline">{dia}</span>
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
                            className={`min-h-[60px] sm:min-h-[80px] md:min-h-[100px] border-r border-b border-gray-200 p-1 sm:p-1.5 md:p-2 
                ${!day ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'} 
                ${isToday ? 'ring-2 ring-primary ring-inset' : ''}
                last:border-r-0`}
                            onClick={() => day && onDayClick && onDayClick(day)}
                        >
                            {day && (
                                <>
                                    {/* Número del día */}
                                    <div
                                        className={`text-right mb-0.5 md:mb-1 text-xs md:text-base ${isToday
                                            ? 'bg-primary text-white rounded-full w-5 h-5 md:w-7 md:h-7 flex items-center justify-center ml-auto font-bold text-xs md:text-base'
                                            : 'text-gray-700 font-semibold'
                                            }`}
                                    >
                                        {day.getDate()}
                                    </div>

                                    {/* Actividades del día */}
                                    <div className="space-y-0.5 md:space-y-1">
                                        {dayActivities.slice(0, 2).map((activity) => (
                                            <div
                                                key={activity.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onActivityClick && onActivityClick(activity);
                                                }}
                                                className="text-[0.6rem] sm:text-xs p-0.5 md:p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                                                style={{ backgroundColor: activity.categoria_color }}
                                            >
                                                <div className="font-medium text-black line-clamp-1 md:line-clamp-2">
                                                    {/* Ocultar hora en móvil para ahorrar espacio */}
                                                    {activity.hora && <span className="mr-1 hidden sm:inline">{activity.hora}</span>}
                                                    {activity.actividad}
                                                </div>
                                            </div>
                                        ))}
                                        {/* Mostrar máximo 2 en móvil, 3 en desktop */}
                                        <div className="hidden md:block">
                                            {dayActivities.length > 2 && dayActivities.slice(2, 3).map((activity) => (
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
                                        </div>
                                        {dayActivities.length > 2 && (
                                            <div className="text-[0.6rem] sm:text-xs text-gray-500 font-medium pl-0.5 md:pl-1">
                                                <span className="md:hidden">+{dayActivities.length - 2}</span>
                                                <span className="hidden md:inline">+{dayActivities.length - 3} más</span>
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