
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  getAllCourses, 
  addCourse,
  updateCourse, 
  deleteCourse,
  getAllSemesters,
  addSemester,
  setActiveSemester,
  Course,
  Semester,
  getSentimentStats,
} from "@/services/feedbackService";
import { toast } from "sonner";
import { Edit, Trash, Plus, MoreVertical, User, School, GraduationCap, BookOpen, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminDashboard = () => {
  const { user, getAllUsers } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  
  const [isAddCourseDialogOpen, setIsAddCourseDialogOpen] = useState(false);
  const [isEditCourseDialogOpen, setIsEditCourseDialogOpen] = useState(false);
  const [isDeleteCourseDialogOpen, setIsDeleteCourseDialogOpen] = useState(false);
  const [isAddSemesterDialogOpen, setIsAddSemesterDialogOpen] = useState(false);
  
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [newCourse, setNewCourse] = useState({
    code: "",
    name: "",
    semesterId: ""
  });
  
  const [newSemester, setNewSemester] = useState({
    name: ""
  });
  
  // Get all users
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(u => u.role === "lecturer");
  const students = allUsers.filter(u => u.role === "student");
  
  // Get global stats
  const stats = getSentimentStats();
  
  // Load semesters and courses
  useEffect(() => {
    const loadedSemesters = getAllSemesters();
    setSemesters(loadedSemesters);
    
    // Set default selected semester to active one or first one
    const activeSemester = loadedSemesters.find(s => s.isActive);
    if (activeSemester) {
      setSelectedSemesterId(activeSemester.id);
    } else if (loadedSemesters.length > 0) {
      setSelectedSemesterId(loadedSemesters[0].id);
    }
    
    setCourses(getAllCourses());
  }, []);
  
  // Filter courses by selected semester
  const filteredCourses = selectedSemesterId 
    ? courses.filter(course => course.semesterId === selectedSemesterId)
    : courses;
  
  const handleAddCourse = () => {
    if (!newCourse.code || !newCourse.name || !newCourse.semesterId) {
      toast.error("Course code, name and semester are required");
      return;
    }
    
    try {
      const added = addCourse(newCourse.code, newCourse.name, newCourse.semesterId);
      setCourses(getAllCourses());
      setIsAddCourseDialogOpen(false);
      setNewCourse({ code: "", name: "", semesterId: selectedSemesterId });
      toast.success(`Course ${added.code} added successfully`);
    } catch (error) {
      toast.error("Failed to add course");
    }
  };
  
  const handleUpdateCourse = () => {
    if (!currentCourse || !currentCourse.code || !currentCourse.name || !currentCourse.semesterId) {
      toast.error("Course details are incomplete");
      return;
    }
    
    try {
      updateCourse(
        currentCourse.id, 
        currentCourse.code, 
        currentCourse.name, 
        currentCourse.semesterId
      );
      setCourses(getAllCourses());
      setIsEditCourseDialogOpen(false);
      setCurrentCourse(null);
      toast.success("Course updated successfully");
    } catch (error) {
      toast.error("Failed to update course");
    }
  };
  
  const handleDeleteCourse = () => {
    if (!currentCourse) return;
    
    try {
      deleteCourse(currentCourse.id);
      setCourses(getAllCourses());
      setIsDeleteCourseDialogOpen(false);
      setCurrentCourse(null);
      toast.success("Course deleted successfully");
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };
  
  const handleAddSemester = () => {
    if (!newSemester.name) {
      toast.error("Semester name is required");
      return;
    }
    
    try {
      const added = addSemester(newSemester.name);
      setSemesters(getAllSemesters());
      setIsAddSemesterDialogOpen(false);
      setNewSemester({ name: "" });
      toast.success(`Semester ${added.name} added successfully`);
    } catch (error) {
      toast.error("Failed to add semester");
    }
  };
  
  const handleSetActiveSemester = (id: string) => {
    try {
      setActiveSemester(id);
      setSemesters(getAllSemesters());
      toast.success("Active semester updated");
    } catch (error) {
      toast.error("Failed to update active semester");
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage semesters, courses, and system settings.
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Semesters</CardTitle>
            <CardDescription>Academic periods</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{semesters.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Courses</CardTitle>
            <CardDescription>All courses in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Users</CardTitle>
            <CardDescription>Students and lecturers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{allUsers.length}</div>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <School size={14} />
                <span>Students: {students.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <GraduationCap size={14} />
                <span>Lecturers: {lecturers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Semester Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Semesters</CardTitle>
            <CardDescription>Add and set active semesters</CardDescription>
          </div>
          <Dialog open={isAddSemesterDialogOpen} onOpenChange={setIsAddSemesterDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus size={16} />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Semester</DialogTitle>
                <DialogDescription>
                  Enter the semester name (e.g., "1.1", "2.2").
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="semester-name">Semester Name</Label>
                  <Input 
                    id="semester-name" 
                    value={newSemester.name} 
                    onChange={e => setNewSemester({...newSemester, name: e.target.value})}
                    placeholder="e.g. 1.1"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSemesterDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleAddSemester}>Add Semester</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of all semesters in the system.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {semesters.length > 0 ? (
                semesters.map(semester => (
                  <TableRow key={semester.id}>
                    <TableCell className="font-medium">{semester.name}</TableCell>
                    <TableCell>
                      {semester.isActive ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {!semester.isActive && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSetActiveSemester(semester.id)}
                        >
                          Set as Active
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    No semesters found. Add your first semester to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Course Management */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Manage Courses</CardTitle>
            <CardDescription>Add, edit, and delete courses</CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select value={selectedSemesterId} onValueChange={setSelectedSemesterId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Semesters</SelectLabel>
                  {semesters.map(semester => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name} {semester.isActive ? "(Active)" : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            
            <Dialog open={isAddCourseDialogOpen} onOpenChange={setIsAddCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus size={16} />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Course</DialogTitle>
                  <DialogDescription>
                    Enter the details for the new course.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="course-code">Course Code</Label>
                    <Input 
                      id="course-code" 
                      value={newCourse.code} 
                      onChange={e => setNewCourse({...newCourse, code: e.target.value})}
                      placeholder="e.g. ISE4201"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course-name">Course Name</Label>
                    <Input 
                      id="course-name" 
                      value={newCourse.name} 
                      onChange={e => setNewCourse({...newCourse, name: e.target.value})}
                      placeholder="e.g. Human Computer Interaction"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select 
                      value={newCourse.semesterId} 
                      onValueChange={(value) => setNewCourse({...newCourse, semesterId: value})}
                    >
                      <SelectTrigger id="semester">
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Available Semesters</SelectLabel>
                          {semesters.map(semester => (
                            <SelectItem key={semester.id} value={semester.id}>
                              {semester.name} {semester.isActive ? "(Active)" : ""}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCourseDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddCourse}>Add Course</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>
              {selectedSemesterId 
                ? `Showing courses for semester ${semesters.find(s => s.id === selectedSemesterId)?.name || ""}` 
                : "Showing all courses"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map(course => {
                  const courseSemester = semesters.find(s => s.id === course.semesterId);
                  
                  return (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.code}</TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>{courseSemester?.name || "Unknown"}</TableCell>
                      <TableCell>
                        {course.lecturerId ? (
                          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                            Taken by {course.lecturerName}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Available</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical size={16} />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => {
                                setCurrentCourse(course);
                                setIsEditCourseDialogOpen(true);
                              }}
                              className="flex items-center gap-2"
                            >
                              <Edit size={14} />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => {
                                setCurrentCourse(course);
                                setIsDeleteCourseDialogOpen(true);
                              }}
                              className="text-destructive flex items-center gap-2"
                            >
                              <Trash size={14} />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {selectedSemesterId 
                      ? "No courses found for this semester. Add your first course to get started."
                      : "No courses found. Add your first course to get started."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Course Dialog */}
      <Dialog open={isEditCourseDialogOpen} onOpenChange={setIsEditCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details.
            </DialogDescription>
          </DialogHeader>
          {currentCourse && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-course-code">Course Code</Label>
                <Input 
                  id="edit-course-code" 
                  value={currentCourse.code} 
                  onChange={e => setCurrentCourse({...currentCourse, code: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-course-name">Course Name</Label>
                <Input 
                  id="edit-course-name" 
                  value={currentCourse.name} 
                  onChange={e => setCurrentCourse({...currentCourse, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-semester">Semester</Label>
                <Select 
                  value={currentCourse.semesterId} 
                  onValueChange={(value) => setCurrentCourse({...currentCourse, semesterId: value})}
                >
                  <SelectTrigger id="edit-semester">
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Available Semesters</SelectLabel>
                      {semesters.map(semester => (
                        <SelectItem key={semester.id} value={semester.id}>
                          {semester.name} {semester.isActive ? "(Active)" : ""}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditCourseDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateCourse}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteCourseDialogOpen} onOpenChange={setIsDeleteCourseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentCourse && (
            <div className="py-4">
              <p><strong>Code:</strong> {currentCourse.code}</p>
              <p><strong>Name:</strong> {currentCourse.name}</p>
              <p><strong>Semester:</strong> {semesters.find(s => s.id === currentCourse.semesterId)?.name || "Unknown"}</p>
              {currentCourse.lecturerId && (
                <p className="text-amber-600 font-medium mt-2">
                  Warning: This course is currently assigned to a lecturer.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteCourseDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCourse}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
