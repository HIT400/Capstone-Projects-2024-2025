// export const createInspector = async (req, res) => {
//     try {
//       const {
//         user_id,
//         first_name,
//         last_name,
//         email,
//         contact,
//         work_id,
//         license_number,
//         specialization,
//         available,
//         slots_booked,
//         assigned_districts,
//         inspection_types
//       } = req.body;
  
//       const newInspector = await createInspectorService(
//         user_id,
//         first_name,
//         last_name,
//         email,
//         contact,
//         work_id,
//         license_number,
//         specialization,
//         available,
//         slots_booked,
//         assigned_districts,
//         inspection_types
//       );
  
//       res.status(201).json({
//         status: 'success',
//         data: {
//           inspector: newInspector
//         }
//       });
//     } catch (err) {
//       res.status(400).json({
//         status: 'error',
//         message: err.message
//       });
//     }
//   };