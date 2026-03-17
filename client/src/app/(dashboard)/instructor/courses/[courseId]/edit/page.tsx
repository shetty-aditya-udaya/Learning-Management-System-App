"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Video, Layout } from "lucide-react";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  // Form states
  const [sectionTitle, setSectionTitle] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");

  const fetchCourseTree = async () => {
    try {
      const res = await api.get(`/courses/${courseId}/tree`);
      setCourse(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseTree();
  }, [courseId]);

  const handleAddSection = async () => {
    try {
      await api.post(`/courses/${courseId}/sections`, { 
        title: sectionTitle,
        orderIndex: course.tree.length + 1
      });
      setSectionTitle("");
      setShowSectionModal(false);
      fetchCourseTree();
    } catch (err) {
      alert("Error adding section");
    }
  };

  const handleAddVideo = async () => {
    try {
      const section = course.tree.find((s: any) => s.id === activeSectionId);
      await api.post(`/courses/sections/${activeSectionId}/videos`, {
        title: videoTitle,
        videoUrl: videoUrl,
        durationSeconds: parseInt(duration),
        orderIndex: section.lessons.length + 1
      });
      setVideoTitle("");
      setVideoUrl("");
      setDuration("");
      setShowVideoModal(false);
      fetchCourseTree();
    } catch (err) {
      alert("Error adding video");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-gray-500">Manage sections and lessons</p>
        </div>
        <button 
          onClick={() => setShowSectionModal(true)}
          className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-50"
        >
          <Plus size={18} />
          Add Section
        </button>
      </div>

      <div className="space-y-6">
        {course.tree.map((section: any) => (
          <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Layout size={20} className="text-gray-400" />
                <h3 className="font-semibold text-gray-900">{section.title}</h3>
              </div>
              <button 
                onClick={() => {
                  setActiveSectionId(section.id);
                  setShowVideoModal(true);
                }}
                className="text-indigo-600 text-sm font-medium hover:underline"
              >
                + Add Video
              </button>
            </div>
            
            <div className="divide-y divide-gray-100">
              {section.lessons.map((video: any) => (
                <div key={video.id} className="px-6 py-4 flex items-center gap-4 group">
                  <Video size={18} className="text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{video.title}</p>
                    <p className="text-xs text-gray-500">{Math.floor(video.duration / 60)}m {video.duration % 60}s</p>
                  </div>
                  <button className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {section.lessons.length === 0 && (
                <div className="px-6 py-8 text-center text-gray-400 text-sm">
                  No videos in this section yet.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Simple Modals (can be factored into components later) */}
      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-lg font-bold">New Section</h3>
            <input 
              className="w-full px-3 py-2 border rounded-lg" 
              placeholder="Section Title"
              value={sectionTitle}
              onChange={e => setSectionTitle(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowSectionModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleAddSection} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Add</button>
            </div>
          </div>
        </div>
      )}

      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold">New Video Lesson</h3>
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Video Title" value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="YouTube URL" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} />
            <input className="w-full px-3 py-2 border rounded-lg" placeholder="Duration (seconds)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowVideoModal(false)} className="flex-1 px-4 py-2 border rounded-lg">Cancel</button>
              <button onClick={handleAddVideo} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to make Trash2 available (since I forgot to import it in the initial write)
import { Trash2 } from "lucide-react";
