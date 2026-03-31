import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function AdminPanel() {
    const { user } = useContext(AuthContext);
    const [groups, setGroups] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Деректерді жүктеу
    const fetchData = async () => {
        try {
            const [groupsRes, teachersRes] = await Promise.all([
                api.get('/groups'),
                api.get('/groups/teachers')
            ]);
            setGroups(groupsRes.data);
            setTeachers(teachersRes.data);
        } catch (error) {
            console.error('Деректерді жүктеу қатесі', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Оқытушыны топқа бекіту функциясы
    const handleAssignTeacher = async (groupId, teacherId) => {
        try {
            // Егер "Таңдау" (бос) тұрса, teacherId null болып кетеді
            await api.put(`/groups/${groupId}/assign`, { teacherId: teacherId || null });
            alert('Оқытушы сәтті бекітілді!');
            fetchData(); // Тізімді жаңарту
        } catch (error) {
            alert('Қате шықты: ' + (error.response?.data?.message || error.message));
        }
    };

    // Қарапайым қорғаныс (Уақытша кез келген мұғалім көре алады деп қояйық немесе тек админ)
    // Қатаң қорғаныс: Тек Бас Админ ғана кіре алады
    if (!user || user.role !== 'admin') {
        return <div style={{ padding: '20px', color: 'red', fontWeight: 'bold', textAlign: 'center' }}>
            ⛔ Рұқсат етілмеген! Бұл бетке тек Бас Админ кіре алады!
        </div>;
    }

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2>Админ Панель: Топтарды басқару</h2>
            <hr />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                {groups.map((group) => (
                    <div key={group.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                        <strong style={{ fontSize: '18px' }}>{group.name}</strong>
                        
                        <div>
                            <span style={{ marginRight: '10px' }}>Оқытушы:</span>
                            <select 
                                value={group.teacher_id || ''} 
                                onChange={(e) => handleAssignTeacher(group.id, e.target.value)}
                                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="">-- Оқытушы таңдалмаған --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.first_name} {t.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AdminPanel;