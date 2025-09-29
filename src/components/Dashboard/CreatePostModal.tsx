import React, { useState, useRef } from "react";
import { X, Upload, Facebook, Instagram, Calendar, Link } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { usePosts } from "../../hooks/usePosts";
import { Channel, PostFormat, MediaFile } from "../../types";
import { supabase } from "../../services/supabaseClient"; // Importamos o Supabase

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { selectedClients, user } = useAuth(); // Pegamos o usuário para o path do arquivo
  const { addPost } = usePosts(); // Removido publishPost, pois será feito no backend
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    clientIds: [] as string[],
    content: "",
    format: "single" as PostFormat,
    channels: [] as Channel[],
    scheduledDate: "",
  });
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Definir data padrão como agora
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const localDateTime = new Date(
        now.getTime() - now.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16);
      setFormData((prev) => ({ ...prev, scheduledDate: localDateTime }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(Array.from(e.target.files));
    }
  };

  const handleFileUpload = async (files: File[]) => {
    setError(null);
    if (files.length === 0 || !user) return;
    setIsUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("media")
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data } = supabase.storage.from("media").getPublicUrl(filePath);

        return {
          id: data.publicUrl,
          type: file.type.startsWith("video/") ? "video" : "image",
          url: data.publicUrl,
        } as MediaFile;
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setMediaFiles((prev) => [...prev, ...uploadedFiles]);
    } catch (error: any) {
      console.error("Erro no upload:", error);
      setError("Falha no upload do arquivo. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeMedia = (mediaId: string) => {
    setMediaFiles((prev) => prev.filter((m) => m.id !== mediaId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.clientIds.length === 0 || mediaFiles.length === 0) {
      setError("Selecione pelo menos um cliente e uma mídia.");
      return;
    }
    setError(null);

    try {
      // Criar posts para cada cliente selecionado
      const postPromises = formData.clientIds.map((clientId) => {
        const selectedClient = selectedClients.find((c) => c.id === clientId);
        if (!selectedClient) return null;

        return addPost({
          clientId,
          clientName: selectedClient.name,
          content: formData.content,
          media: mediaFiles,
          format: formData.format,
          channels: formData.channels,
          scheduledDate: formData.scheduledDate || new Date().toISOString(),
          status: "pending_approval",
          approvalLink: `${
            window.location.origin
          }/approve/${Date.now()}-${Math.random()}`,
        });
      });

      await Promise.all(postPromises.filter(Boolean));

      resetFormAndClose();
    } catch (error) {
      console.error("Erro ao criar post:", error);
      setError("Não foi possível criar o post. Tente novamente.");
    }
  };

  const resetFormAndClose = () => {
    setFormData({
      clientIds: [],
      content: "",
      format: "single",
      channels: [],
      scheduledDate: "",
    });
    setMediaFiles([]);
    setError(null);
    setIsUploading(false);
    onClose();
  };

  const toggleChannel = (channel: Channel) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter((c) => c !== channel)
        : [...prev.channels, channel],
    }));
  };

  const toggleClient = (clientId: string) => {
    setFormData((prev) => ({
      ...prev,
      clientIds: prev.clientIds.includes(clientId)
        ? prev.clientIds.filter((id) => id !== clientId)
        : [...prev.clientIds, clientId],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Criar Novo Post
          </h2>
          <button
            onClick={resetFormAndClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Clientes (pode selecionar múltiplos)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-3">
              {selectedClients.map((client) => (
                <label
                  key={client.id}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.clientIds.includes(client.id)}
                    onChange={() => toggleClient(client.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {client.avatar && (
                    <img
                      src={client.avatar}
                      alt={client.displayName || client.name}
                      className="w-6 h-6 rounded-full"
                    />
                  )}
                  <span className="text-sm">
                    {client.displayName || client.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mídia
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                dragActive
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              {isUploading ? (
                <p className="mt-2 text-sm text-blue-600">
                  Enviando arquivos...
                </p>
              ) : (
                <>
                  <p className="mt-2 text-sm text-gray-600">
                    Clique para fazer upload ou arraste arquivos aqui
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, MP4 até 50MB
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileInput}
              className="hidden"
              disabled={isUploading}
            />
            {mediaFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {mediaFiles.map((media) => (
                  <div key={media.id} className="relative">
                    <img
                      src={media.url}
                      alt="Preview"
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeMedia(media.id)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Legenda
            </label>
            <textarea
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite a legenda do post..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={formData.format}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    format: e.target.value as PostFormat,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="single">Foto única</option>
                <option value="carousel">Carrossel</option>
                <option value="story">Story</option>
                <option value="reels">Reels</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Onde Publicar
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes("facebook")}
                    onChange={() => toggleChannel("facebook")}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Facebook size={20} className="text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.channels.includes("instagram")}
                    onChange={() => toggleChannel("instagram")}
                    className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  />
                  <Instagram size={20} className="text-pink-600" />
                  <span className="text-sm">Instagram</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Agendamento
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    scheduledDate: e.target.value,
                  }))
                }
                required
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={resetFormAndClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                isUploading ||
                formData.clientIds.length === 0 ||
                !formData.content ||
                formData.channels.length === 0 ||
                mediaFiles.length === 0
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Enviando..." : "Criar e Enviar para Aprovação"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
