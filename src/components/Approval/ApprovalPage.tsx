import React, { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Check,
  X,
  CreditCard as Edit2,
  Facebook,
  Instagram,
  Calendar,
  Eye,
} from "lucide-react";
import { usePosts } from "../../hooks/usePosts";

const formatLabels: Record<string, string> = {
  single: "Foto única",
  carousel: "Carrossel",
  story: "Story",
  reels: "Reels",
};

export const ApprovalPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const { getPostById, updatePostStatus, updatePostContent } = usePosts();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const post = postId ? getPostById(postId) : null;

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Post não encontrado
          </h1>
          <p className="text-gray-600">
            O post que você está procurando não existe ou foi removido.
          </p>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    if (window.confirm("Tem certeza que deseja aprovar este post?")) {
      updatePostStatus(post.id, "approved");
      alert("Post aprovado com sucesso!");
    }
  };

  const handleReject = () => {
    if (window.confirm("Tem certeza que deseja rejeitar este post?")) {
      updatePostStatus(post.id, "rejected");
      alert("Post rejeitado.");
    }
  };

  const handleSaveEdit = () => {
    updatePostContent(post.id, editedContent);
    setIsEditing(false);
    alert("Legenda atualizada com sucesso!");
  };

  const startEditing = () => {
    setEditedContent(post.content);
    setIsEditing(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-BR");
  };

  if (post.status === "approved") {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post Aprovado!
          </h1>
          <p className="text-gray-600">
            Este post já foi aprovado e será publicado na data agendada.
          </p>
        </div>
      </div>
    );
  }

  if (post.status === "rejected") {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X size={32} className="text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post Rejeitado
          </h1>
          <p className="text-gray-600">
            Este post foi rejeitado e não será publicado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h1 className="text-xl font-bold text-white">Aprovação de Post</h1>
            <p className="text-blue-100 text-sm mt-1">
              Revise e aprove o conteúdo abaixo
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Media Section */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Mídia
                </h2>
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={post.media[currentImageIndex]?.url}
                      alt="Post media"
                      className="w-full h-64 object-contain bg-gray-100 rounded-lg"
                    />
                    {post.media.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {post.media.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentImageIndex
                                ? "bg-white"
                                : "bg-white bg-opacity-50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {post.media.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto">
                      {post.media.map((media, index) => (
                        <button
                          key={media.id}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex
                              ? "border-blue-500"
                              : "border-gray-200"
                          }`}
                        >
                          <img
                            src={media.url}
                            alt={`Media ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalhes
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Cliente:
                      </span>
                      <span className="text-sm text-gray-900">
                        {post.clientName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Formato:
                      </span>
                      <div className="flex items-center space-x-1">
                        <Eye size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatLabels[post.format]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-600">
                        Canais:
                      </span>
                      <div className="flex space-x-2">
                        {post.channels.includes("facebook") && (
                          <Facebook size={16} className="text-blue-600" />
                        )}
                        {post.channels.includes("instagram") && (
                          <Instagram size={16} className="text-pink-600" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-gray-600">
                        Data de Publicação:
                      </span>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatDate(post.scheduledDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Caption Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Legenda
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={startEditing}
                        className="flex items-center space-x-1 px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Edit2 size={14} />
                        <span>Editar</span>
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-3">
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {post.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-center space-x-4">
              <button
                onClick={handleReject}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X size={18} />
                <span>Rejeitar</span>
              </button>
              <button
                onClick={handleApprove}
                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Check size={18} />
                <span>Aprovar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
