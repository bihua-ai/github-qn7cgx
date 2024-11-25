import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { ListType, Resident, Group, LLMModel, ApiResponse, ResidentsResponse, GroupsResponse, LLMModelResponse } from '../types/list';
import { buildApiUrl } from '../config/api';
import ItemList from './ItemList';
import { useLanguage } from '../contexts/LanguageContext';
import ResidentDetailView from './ResidentDetailView';
import GroupDetailView from './GroupDetailView';
import Pagination from './Pagination';
import { UserPlus, Play, Square, X } from 'lucide-react';

// ... RegisterDialog component remains the same ...

export default function ListContainer() {
  const { type, id } = useParams<{ type: ListType; id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<(Resident | Group | LLMModel)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Pagination state
  const itemsPerPage = 10;
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchItems = async () => {
      if (!type) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(buildApiUrl(`/${type}`));
        if (!response.ok) throw new Error(`Failed to fetch ${type}`);
        
        const data = await response.json();
        
        switch (type) {
          case 'residents':
            setItems((data as ResidentsResponse).residents);
            break;
          case 'groups':
            setItems((data as GroupsResponse).groups);
            break;
          case 'models':
            setItems((data as LLMModelResponse).llm_model_list);
            break;
        }
      } catch (err) {
        setError(language === 'en' 
          ? `Failed to load ${type}` 
          : `加载${type === 'residents' ? '居民' : type === 'groups' ? '群组' : '模型'}失败`);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [type, language]);

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
  };

  const handleItemClick = (item: Resident | Group | LLMModel) => {
    const itemId = 'resident_id' in item 
      ? item.resident_id 
      : 'group_id' in item 
        ? item.group_id 
        : item.model_id;
    navigate(`/${type}/${itemId}`);
  };

  const handleRegisterResident = async (username: string, password: string) => {
    setRegisterError(null);
    setActionLoading('register');
    try {
      const response = await fetch(buildApiUrl('/register'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to register resident');
      }

      setIsRegisterDialogOpen(false);
      // Refresh the list
      window.location.reload();
    } catch (err) {
      setRegisterError(language === 'en' 
        ? 'Failed to register resident' 
        : '注册居民失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRunAgents = async () => {
    setActionLoading('run');
    try {
      const response = await fetch(buildApiUrl('/agents/run'), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to run agents');
      }
    } catch (err) {
      setError(language === 'en' 
        ? 'Failed to run agents' 
        : '启动代理失败');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStopAgents = async () => {
    setActionLoading('stop');
    try {
      const response = await fetch(buildApiUrl('/agents/stop'), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to stop agents');
      }
    } catch (err) {
      setError(language === 'en' 
        ? 'Failed to stop agents' 
        : '停止代理失败');
    } finally {
      setActionLoading(null);
    }
  };

  if (!type) {
    return (
      <div className="text-center text-gray-500 mt-8">
        {language === 'en' 
          ? 'Invalid page' 
          : '无效页面'}
      </div>
    );
  }

  return (
    <div className="flex h-full gap-6">
      <div className="w-80 bg-white rounded-lg shadow-sm">
        {type === 'residents' && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setIsRegisterDialogOpen(true)}
                disabled={actionLoading === 'register'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'register' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Register Resident' : '注册居民'}
                  </>
                )}
              </button>
              <button
                onClick={handleRunAgents}
                disabled={actionLoading === 'run'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'run' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Run Agents' : '启动代理'}
                  </>
                )}
              </button>
              <button
                onClick={handleStopAgents}
                disabled={actionLoading === 'stop'}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {actionLoading === 'stop' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'Stop Agents' : '停止代理'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          ) : (
            <>
              <ItemList
                items={paginatedItems}
                type={type}
                onItemClick={handleItemClick}
              />
              {items.length > itemsPerPage && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
        {id ? (
          type === 'residents' ? (
            <ResidentDetailView resident={items.find(r => 'resident_id' in r && r.resident_id === id) as Resident} />
          ) : type === 'groups' ? (
            <GroupDetailView group={items.find(g => 'group_id' in g && g.group_id === id) as Group} />
          ) : (
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {(items.find(m => 'model_id' in m && m.model_id === id) as LLMModel)?.model_id}
              </h3>
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'Detailed information will be displayed here.'
                  : '详细信息将显示在这里。'}
              </p>
            </div>
          )
        ) : (
          <div className="text-center text-gray-500 mt-8">
            {language === 'en' 
              ? 'Select an item to view details'
              : '选择一个项目查看详情'}
          </div>
        )}
      </div>

      <RegisterDialog
        isOpen={isRegisterDialogOpen}
        onClose={() => {
          setIsRegisterDialogOpen(false);
          setRegisterError(null);
        }}
        onRegister={handleRegisterResident}
        isLoading={actionLoading === 'register'}
        error={registerError}
      />
    </div>
  );
}